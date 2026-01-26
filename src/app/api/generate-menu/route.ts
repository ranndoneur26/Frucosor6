import { NextRequest, NextResponse } from 'next/server';
import { unifiedGenerateMenu } from '@/lib/ai-provider';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userRequest, lang } = body;

    if (!userRequest) {
      return NextResponse.json(
        { error: 'User request is required' },
        { status: 400 }
      );
    }

    const menuPlan = await unifiedGenerateMenu(userRequest, lang);
    return NextResponse.json(menuPlan);
  } catch (error) {
    console.error('Menu generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate menu' },
      { status: 500 }
    );
  }
}
