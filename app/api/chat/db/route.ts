import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET /api/chat/db - Get all chats for user
export async function GET(request: NextRequest) {
  const authPayload = verifyAuth(request);
  if (!authPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const chats = await prisma.chat.findMany({
      where: {
        userId: authPayload.userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

// POST /api/chat/db - Create new chat
export async function POST(request: NextRequest) {
  const authPayload = verifyAuth(request);
  if (!authPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title } = await request.json();

    const chat = await prisma.chat.create({
      data: {
        userId: authPayload.userId,
        title: title || 'Diskusi Baru',
      },
      include: {
        messages: true,
      },
    });

    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/db?id={chatId} - Delete chat
export async function DELETE(request: NextRequest) {
  const authPayload = verifyAuth(request);
  if (!authPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('id');

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership before deletion
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: authPayload.userId,
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found or unauthorized' },
        { status: 404 }
      );
    }

    await prisma.chat.delete({
      where: {
        id: chatId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat' },
      { status: 500 }
    );
  }
} 