import {NextResponse} from 'next/server';
import {getSummaryById, updateSummaryById} from '../../../../../lib/database';
import {generateSummaryWithOllama} from '../../../../../lib/ollama';
import {isSameOriginRequest} from '../../../../../lib/security';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function PUT(request: Request, context: RouteContext) {
    if (!isSameOriginRequest(request)) {
        return NextResponse.json({error: '不正なリクエストです'}, {status: 403});
    }

    try {
        const {id} = await context.params;
        const summaryId = Number(id);

        if (!Number.isInteger(summaryId) || summaryId <= 0) {
            return NextResponse.json({error: 'idが不正です'}, {status: 400});
        }

        const existingSummary = getSummaryById(summaryId);
        if (!existingSummary) {
            return NextResponse.json({error: '要約が見つかりません'}, {status: 404});
        }

        const body = await request.json() as { instruction?: string };
        const instruction = body.instruction?.trim();

        const {summaryText, model} = await generateSummaryWithOllama(existingSummary.originalText, instruction);
        const updatedSummary = updateSummaryById(summaryId, {
            summaryText,
            instruction: instruction || null,
            model,
        });

        if (!updatedSummary) {
            return NextResponse.json({error: '要約の更新に失敗しました'}, {status: 500});
        }

        return NextResponse.json(updatedSummary);
    } catch (error) {
        console.error('要約の再生成に失敗しました:', error);
        return NextResponse.json({error: '要約の再生成に失敗しました'}, {status: 500});
    }
}
