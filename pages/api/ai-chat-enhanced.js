import { Configuration, OpenAIApi } from 'openai';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Configure OpenAI API client
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Maximum number of tokens to generate in the response
const MAX_TOKENS = 1024;

// Cache for documentation content
let docsCache = null;

// Function to get all MDX files in a directory recursively
function getAllMdxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllMdxFiles(filePath, fileList);
    } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to load and parse MDX/MD files
function getDocsContent() {
  if (docsCache) return docsCache;
  
  const docsDirectory = path.join(process.cwd(), 'pages');
  const mdxFiles = getAllMdxFiles(docsDirectory);
  
  const docs = mdxFiles.map(filePath => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    const relativePath = filePath.replace(process.cwd(), '').replace(/\\/g, '/');
    
    return {
      path: relativePath,
      title: data.title || path.basename(filePath, path.extname(filePath)),
      content: content,
    };
  });
  
  docsCache = docs;
  return docs;
}

// Function to get embeddings for a text
async function getEmbedding(text) {
  try {
    const response = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: text,
    });
    
    return response.data.data[0].embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw error;
  }
}

// Function to compute cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

// Function to find relevant docs based on user query
async function findRelevantDocs(query, topK = 3) {
  try {
    const docs = getDocsContent();
    const queryEmbedding = await getEmbedding(query);
    
    // Get embeddings for each document (in a real implementation, these would be pre-computed)
    const docsWithScores = [];
    
    for (const doc of docs) {
      // For performance reasons, only use the first 8000 characters of each document
      const docEmbedding = await getEmbedding(doc.content.slice(0, 8000));
      const similarity = cosineSimilarity(queryEmbedding, docEmbedding);
      
      docsWithScores.push({
        ...doc,
        similarity,
      });
    }
    
    // Sort by similarity and get top K results
    docsWithScores.sort((a, b) => b.similarity - a.similarity);
    return docsWithScores.slice(0, topK);
  } catch (error) {
    console.error('Error finding relevant docs:', error);
    return [];
  }
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const { messages, currentPath } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Get the user's latest message
    const userMessage = messages[messages.length - 1].content;
    
    // Find relevant docs based on user's query
    const relevantDocs = await findRelevantDocs(userMessage);
    
    // Create context from relevant docs
    let context = '';
    if (relevantDocs.length > 0) {
      context = relevantDocs.map(doc => {
        return `--- Document: ${doc.title} (${doc.path}) ---\n${doc.content.slice(0, 1500)}...\n\n`;
      }).join('\n');
    }

    // Format messages for OpenAI API
    const formattedMessages = [
      {
        role: 'system',
        content: `You are an AI assistant for the NERO Chain blockchain documentation. 
        Your purpose is to help users understand NERO Chain concepts, find information in the docs, and solve common issues.
        The user is currently viewing the page: ${currentPath || 'unknown'}.
        
        Here are some relevant sections from the documentation to help answer the user's query:
        ${context}
        
        Use the above documentation to provide accurate answers when possible.
        If the documentation doesn't cover the topic, say so and give the best answer you can based on general knowledge.
        Format your responses using Markdown for better readability.
        Keep responses concise but informative.`
      },
      ...messages
    ];

    // Call OpenAI API
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: formattedMessages,
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Get the response content
    const aiResponse = response.data.choices[0].message.content;

    // Return the response with metadata about sources
    return res.status(200).json({ 
      response: aiResponse,
      sources: relevantDocs.map(doc => ({
        title: doc.title,
        path: doc.path,
        relevance: doc.similarity
      }))
    });
  } catch (error) {
    console.error('Error processing AI chat request:', error);
    return res.status(500).json({ 
      error: 'Error processing request', 
      details: error.message 
    });
  }
} 