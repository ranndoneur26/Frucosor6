import { NextRequest, NextResponse } from 'next/server';
import { unifiedAnalyze } from '@/lib/ai-provider';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { image, text, lang } = body;

        if (!image && !text) {
            return NextResponse.json(
                { error: 'Either image (base64) or text must be provided' },
                { status: 400 }
            );
        }

        // Remove data URL prefix if present in image
        const base64Data = image ? image.replace(/^data:image\/\w+;base64,/, '') : undefined;

        const result = await unifiedAnalyze({ image: base64Data, text }, lang);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze food' },
            { status: 500 }
        );
    }
}
