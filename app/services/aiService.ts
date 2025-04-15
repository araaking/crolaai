import { MessageRole } from '@prisma/client';

interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function getAIResponse(messages: { role: MessageRole; content: string }[]): Promise<string | null> {
  const API_KEY = process.env.AI_API_KEY;
  const API_ENDPOINT = process.env.AI_API_ENDPOINT;

  if (!API_KEY || !API_ENDPOINT) {
    console.error('AI Service API Key or Endpoint is not configured in environment variables.');
    return 'Error: AI service is not configured.';
  }

  const formattedMessages: AIMessage[] = messages.map(msg => ({
    role: msg.role === MessageRole.USER ? 'user' : 'assistant',
    content: msg.content,
  }));

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL_NAME || 'openai/gpt-3.5-turbo',
        messages: formattedMessages,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`AI API Error (${response.status}): ${errorBody}`);
      return `Error: Failed to get response from AI service (Status: ${response.status}).`;
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    if (!aiContent) {
      console.error('AI API Error: No content found in response', data);
      return 'Error: Received an empty response from AI.'
    }

    return aiContent.trim();

  } catch (error) {
    console.error('Error calling AI service:', error);
    return 'Error: Could not connect to the AI service.';
  }
} 