import { NextRequest, NextResponse } from 'next/server';
import { unifiedGenerateReport } from '@/lib/ai-provider';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { topic, data, lang } = body;
        const inputData = data || topic;

        if (!inputData) {
            return NextResponse.json(
                { error: 'Topic or Data is required' },
                { status: 400 }
            );
        }

        const report = await unifiedGenerateReport(inputData, lang || 'en');
        return NextResponse.json({ report });
    } catch (error) {
        console.error('Report generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate report' },
            { status: 500 }
        );
    }
}
