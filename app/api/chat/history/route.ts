// app/api/chat/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const historyQuerySchema = z.object({
  chatId: z.string().cuid({ message: 'Valid chatId query parameter is required' }),
});

export async function GET(request: NextRequest) {
  const authPayload = verifyAuth(request);
  if (!authPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = authPayload.userId;

  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());

  const validationResult = historyQuerySchema.safeParse(queryParams);
  if (!validationResult.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: validationResult.error.errors }, { status: 400 });
  }
  const { chatId } = validationResult.data;

  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userId: userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ history: chat.messages }, { status: 200 });

  } catch (error) {
    console.error('Chat History Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'An internal server error occurred while fetching chat history' }, { status: 500 });
  }
}
