// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { getAIResponse } from '@/lib/services/ai';

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

export async function POST(req: Request) {
  try {
    const { message, modelId } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Dapatkan response AI dengan model yang dipilih
    const aiResponse = await getAIResponse(message, [], modelId);

    // Langsung return response tanpa reasoning process
    return NextResponse.json({ response: aiResponse });
    
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
