const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';
const OLLAMA_TIMEOUT_MS = 60_000;

interface OllamaResponse {
    response?: string;
    error?: string;
}

export function buildSummaryPrompt(originalText: string, instruction?: string): string {
    const trimmedInstruction = instruction?.trim();
    if (trimmedInstruction) {
        return `以下の文章を日本語で要約してください。\n追加指示: ${trimmedInstruction}\n\n${originalText}`;
    }

    return `以下の文章を日本語で要約してください:\n\n${originalText}`;
}

export async function generateSummaryWithOllama(originalText: string, instruction?: string): Promise<{
    summaryText: string;
    model: string;
}> {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(OLLAMA_TIMEOUT_MS),
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt: buildSummaryPrompt(originalText, instruction),
            stream: false,
        }),
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Ollamaへの要約リクエストに失敗しました');
    }

    const data = await response.json() as OllamaResponse;
    if (!data.response) {
        throw new Error(data.error || 'Ollamaから要約結果を取得できませんでした');
    }

    return {
        summaryText: data.response.trim(),
        model: OLLAMA_MODEL,
    };
}
