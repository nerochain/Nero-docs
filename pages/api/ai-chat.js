import { Configuration, OpenAIApi } from 'openai';

// Configure OpenAI API client
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Maximum number of tokens to generate in the response
const MAX_TOKENS = 1024;

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

    // Format messages for OpenAI API
    const formattedMessages = [
      {
        role: 'system',
        content: `You are an AI assistant for the NERO Chain blockchain documentation. 
        Your purpose is to help users understand NERO Chain concepts, find information in the docs, and solve common issues.
        The user is currently viewing the page: ${currentPath || 'unknown'}.
        Provide concise, accurate answers based on the documentation content.
        If you don't know the answer, say so and suggest where they might find the information.
        Format your responses using Markdown for better readability.`
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

    // Return the response
    return res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error('Error processing AI chat request:', error);
    return res.status(500).json({ 
      error: 'Error processing request', 
      details: error.message 
    });
  }
} 