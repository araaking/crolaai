// app/api/chat/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { getAIResponse } from '@/lib/services/ai';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { MessageRole } from '@prisma/client';

// Daftar model yang tersedia per provider
const AVAILABLE_MODELS = {
  requesty: [
    { id: 'openai/gpt-4o', name: 'GPT-4o', isReasoning: false },
    { id: 'deepseek/deepseek-reasoner', name: 'Deepseek R1', isReasoning: true },
    { id: 'deepseek/deepseek-chat', name: 'Deepseek V3', isReasoning: false }
  ],
  deepseek: [
    { id: 'deepseek-reasoning', name: 'Deepseek R1', isReasoning: true }
  ]
};

export async function POST(req: NextRequest) {
  const authPayload = verifyAuth(req);
  if (!authPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { message, modelId, chatId } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Create new chat if chatId not provided
    let currentChatId = chatId;
    if (!currentChatId) {
      const newChat = await prisma.chat.create({
        data: {
          userId: authPayload.userId,
          title: message.length > 30 ? message.substring(0, 30) + '...' : message,
        },
      });
      currentChatId = newChat.id;
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        chatId: currentChatId,
        role: MessageRole.USER,
        content: message,
      },
    });

    // Get AI response
    const aiResponse = await getAIResponse(message, [], modelId);

    // Save AI response
    const assistantMessage = await prisma.message.create({
      data: {
        chatId: currentChatId,
        role: MessageRole.ASSISTANT,
        content: aiResponse,
      },
    });

    // Get updated chat with messages
    const updatedChat = await prisma.chat.findUnique({
      where: { id: currentChatId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json({ 
      response: aiResponse,
      chat: updatedChat
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

// Endpoint untuk mendapatkan daftar model yang tersedia
export async function GET() {
  try {
    const USE_REQUESTY = process.env.USE_REQUESTY === 'true';
    console.log('USE_REQUESTY:', USE_REQUESTY);
    
    const models = USE_REQUESTY ? AVAILABLE_MODELS.requesty : AVAILABLE_MODELS.deepseek;
    console.log('Available models:', models);
    
    return NextResponse.json({ 
      models,
      provider: USE_REQUESTY ? 'Requesty' : 'Deepseek'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Error getting models:', error);
    return NextResponse.json(
      { error: 'Failed to get available models' },
      { status: 500 }
    );
  }
}
