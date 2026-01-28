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

        // Robustly extract base64 data handling various Data URI formats
        let base64Data = undefined;
        if (image) {
            // 1. Remove Data URI prefix if present (e.g., "data:image/jpeg;base64,")
            if (image.includes(',')) {
                base64Data = image.split(',')[1];
            } else {
                base64Data = image;
            }

            // 2. Remove all whitespace (newlines, spaces, tabs)
            base64Data = base64Data.replace(/\s/g, '');

            // 3. Fix padding (base64 length must be multiple of 4)
            const padding = base64Data.length % 4;
            if (padding > 0) {
                base64Data += '='.repeat(4 - padding);
                console.log(`Added ${4 - padding} padding characters`);
            }
        }

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
