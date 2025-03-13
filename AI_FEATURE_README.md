# NERO Chain Documentation "Ask AI" Feature

This README explains how to configure and use the "Ask AI" feature for the NERO Chain documentation.

## Overview

The "Ask AI" feature adds an AI-powered chat interface to the documentation site, allowing users to ask questions about NERO Chain and get immediate answers. The feature uses OpenAI's API to generate responses based on user queries.

## Setup Instructions

### 1. API Key Configuration

1. Create an OpenAI API key at [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Copy the `.env.local.example` file to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
3. Add your OpenAI API key to the `.env.local` file:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### 2. Choosing the Implementation

There are two versions of the AI chat feature:

1. **Basic Version (`AskAI.jsx` + `ai-chat.js`)**: Simple implementation using OpenAI API without context from the documentation.
2. **Enhanced Version (`AskAIWithSources.jsx` + `ai-chat-enhanced.js`)**: Advanced implementation that searches through documentation content to provide more accurate answers and cites sources.

To use the basic version, the current implementation in `_app.tsx` is already set up. To use the enhanced version:

```jsx
// In _app.tsx
import dynamic from 'next/dynamic'

// Change this line to use the enhanced version
const AskAI = dynamic(() => import('../components/AskAIWithSources'), {
  ssr: false,
})
```

## How It Works

### Basic Version

1. User asks a question via the chat interface
2. Question is sent to the OpenAI API through the `/api/ai-chat` endpoint
3. OpenAI generates a response based on its training data
4. Response is displayed to the user

### Enhanced Version

1. User asks a question via the chat interface
2. Question is sent to the OpenAI API through the `/api/ai-chat-enhanced` endpoint
3. The system finds relevant documentation pages using text embeddings
4. These relevant documentation sections are included in the prompt to OpenAI
5. OpenAI generates a response based on both the documentation content and its training data
6. Response is displayed to the user along with sources from the documentation

## Customization

### Styling

The chat interface styling is defined in the component files. You can modify these files to change the appearance:

- `AskAI.jsx` or `AskAIWithSources.jsx` - for the chat UI
- Update the brand colors by modifying the Tailwind classes (e.g., `bg-nero-brand`)

### API Configuration

You can modify the API configuration in:

- `api/ai-chat.js` or `api/ai-chat-enhanced.js`
- Change the `model` parameter to use a different OpenAI model
- Adjust the `temperature`, `top_p`, and other parameters to control the response style

### System Prompt

The system prompt defines how the AI should behave. You can modify it in the API files:

```javascript
const formattedMessages = [
  {
    role: 'system',
    content: `You are an AI assistant for the NERO Chain blockchain documentation...`
    // Modify this content to change the AI's behavior
  },
  ...messages
];
```

## Production Considerations

For production deployment:

1. **Rate Limiting**: Implement rate limiting to prevent abuse
2. **Cost Management**: Monitor API usage to control costs
3. **Caching**: Consider caching common queries to reduce API calls
4. **Error Handling**: Enhance error handling for production robustness

## Potential Enhancements

1. **User Feedback**: Add thumbs up/down buttons for users to provide feedback on responses
2. **Conversation History**: Store conversation history for each user
3. **Analytics**: Track common questions to improve documentation
4. **Pre-computed Embeddings**: Generate and store embeddings for all documentation pages in advance for better performance
5. **Custom Training**: Fine-tune a model specifically on NERO Chain documentation

## Troubleshooting

### Common Issues

1. **API Key Issues**: If responses fail, check that your OpenAI API key is correctly set in `.env.local`
2. **CORS Errors**: If you see CORS errors, ensure your API routes are properly configured
3. **Rate Limiting**: If you hit OpenAI rate limits, implement a queue system or increase your usage tier

For additional help, refer to the [OpenAI API documentation](https://platform.openai.com/docs/api-reference). 