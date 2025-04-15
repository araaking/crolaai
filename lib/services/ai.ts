// lib/services/ai.ts
import axios, { AxiosError } from 'axios';
import { Message, MessageRole } from '@prisma/client';

// Konfigurasi API
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const REQUESTY_API_KEY = process.env.REQUESTY_API_KEY;
const REQUESTY_API_URL = "https://router.requesty.ai/v1/chat/completions";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// Pilih provider berdasarkan env
const USE_REQUESTY = process.env.USE_REQUESTY === 'true';
const API_KEY = USE_REQUESTY ? REQUESTY_API_KEY : DEEPSEEK_API_KEY;
const API_URL = USE_REQUESTY ? REQUESTY_API_URL : DEEPSEEK_API_URL;
const AI_MODEL = USE_REQUESTY ? "openai/gpt-4o" : "deepseek-chat";

// Warn if the API key is missing
if (!API_KEY) {
  console.warn(`Missing ${USE_REQUESTY ? 'REQUESTY' : 'DEEPSEEK'}_API_KEY environment variable. AI features will be disabled or fail.`);
}

// Structure expected by many chat completion APIs (like OpenAI/OpenRouter)
interface ChatCompletionMessage {
  role: string;
  parts?: { text: string }[];
  content?: string;
}

/**
 * Gets a response from the configured AI model via OpenRouter.
 *
 * @param userMessageContent - The latest message content from the user.
 * @param history - Optional: Previous messages (role and content) for context.
 * @param modelId - Optional: Specific model ID to use.
 * @returns The AI's response content as a string.
 * @throws Error if the API call fails or API key is missing.
 */
export const getAIResponse = async (
    userMessageContent: string,
    history: Pick<Message, 'role' | 'content'>[] = [],
    modelId?: string
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("AI Service is not configured (missing API key).");
  }

  // Gunakan modelId jika ada, jika tidak gunakan default
  const selectedModel = modelId || AI_MODEL;

  // Format messages based on model
  let messages: ChatCompletionMessage[];
  
  // Format untuk semua model (OpenAI compatible)
  messages = [
    { 
      role: 'system', 
      content: `Kamu adalah asisten AI yang menggunakan model ${selectedModel}.
      - Gunakan bahasa Indonesia yang mudah dipahami
      - Jawab dengan singkat dan to the point
      - Format jawaban dengan bullet points bila perlu
      - Fokus pada solusi praktis
      - Hindari penjelasan teoritis kecuali diminta
      - Berikan contoh kode bila relevan
      - Jika ditanya tentang model, jawab bahwa kamu menggunakan model ${selectedModel}`
    },
    ...history.map(msg => ({
      role: msg.role.toLowerCase(),
      content: msg.content
    })),
    { role: 'user', content: userMessageContent }
  ];

  console.log(`Sending ${messages.length} messages to AI model ${selectedModel}`);

  try {
    console.log('Sending request to API:', {
      model: selectedModel,
      messages: messages,
      url: API_URL
    });

    const response = await axios.post(
      API_URL,
      {
        model: selectedModel,
        messages: messages,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          ...(USE_REQUESTY && {
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Crola Chat'
          })
        },
        timeout: 30000,
      }
    );

    console.log('OpenRouter response:', response.data);

    // Extract response - format yang sama untuk semua model
    const aiMessageContent = response.data?.choices?.[0]?.message?.content;

    if (!aiMessageContent) {
      console.error("AI response format unexpected or empty:", response.data);
      throw new Error("Failed to get a valid or non-empty response from AI service.");
    }

    console.log("Received AI response successfully.");
    return aiMessageContent.trim();

  } catch (error: unknown) {
    console.error("Error calling AI service:", error);
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      const status = axiosError.response?.status;
      const errorData = axiosError.response?.data;
      
      console.error(`AI API Error (${status}):`, errorData);
      throw new Error(`Failed to communicate with AI service: ${errorData?.error?.message || error.message}`);
    }
    
    throw new Error(`Failed to communicate with AI service: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Note: If using Requesty.ai or another provider, adapt the API URL, model name,
// headers, request payload structure, and response parsing according to their documentation.
