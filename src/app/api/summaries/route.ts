import {NextResponse} from 'next/server';
import {createSummary, listSummaries} from '../../../../lib/database';
import {generateSummaryWithOllama} from '../../../../lib/ollama';
import {isSameOriginRequest} from '../../../../lib/security';

export async function GET() {
    try {
        return NextResponse.json(listSummaries());
    } catch (error) {
        console.error('要約一覧の取得に失敗しました:', error);
        return NextResponse.json({error: '要約一覧の取得に失敗しました'}, {status: 500});
    }
}

export async function POST(request: Request) {
    if (!isSameOriginRequest(request)) {
        return NextResponse.json({error: '不正なリクエストです'}, {status: 403});
    }

    try {
        const body = await request.json() as { originalText?: string };
        const originalText = body.originalText?.trim();

        if (!originalText) {
            return NextResponse.json({error: 'originalTextは必須です'}, {status: 400});
        }

        const {summaryText, model} = await generateSummaryWithOllama(originalText);
        const summary = createSummary({originalText, summaryText, model});

        return NextResponse.json(summary, {status: 201});
    } catch (error) {
        console.error('要約の生成に失敗しました:', error);
        return NextResponse.json({error: '要約の生成に失敗しました'}, {status: 500});
    }
}
