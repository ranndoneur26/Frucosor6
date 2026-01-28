import { NextRequest, NextResponse } from 'next/server';
import { unifiedAnalyze } from '@/lib/ai-provider';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { image, text, lang } = body;

        console.log('=== ANALYZE API CALLED ===');
        console.log('Has image:', !!image);
        console.log('Image length:', image?.length || 0);
        console.log('Has text:', !!text);
        console.log('Lang:', lang);

        if (!image && !text) {
            return NextResponse.json(
                { error: 'Either image (base64) or text must be provided' },
                { status: 400 }
            );
        }

        // Remove data URL prefix if present in image
        const base64Data = image ? image.replace(/^data:image\/\w+;base64,/, '') : undefined;
        console.log('Base64 data length after cleanup:', base64Data?.length || 0);

        const result = await unifiedAnalyze({ image: base64Data, text }, lang);
        console.log('Analysis result:', JSON.stringify(result).substring(0, 200));

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('=== ANALYSIS ERROR ===');
        console.error('Error name:', error?.name);
        console.error('Error message:', error?.message);
        console.error('Error stack:', error?.stack?.substring(0, 500));
        return NextResponse.json(
            { error: `Analysis failed: ${error?.message || 'Unknown error'}` },
            { status: 500 }
        );
    }
}
