'use client';

import {FormEvent, useEffect, useState} from 'react';

interface Summary {
    id: number;
    originalText: string;
    summaryText: string;
    instruction: string | null;
    model: string;
    createdAt: string;
    updatedAt: string;
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('ja-JP');
}

export default function Home() {
    const [originalText, setOriginalText] = useState('');
    const [summaries, setSummaries] = useState<Summary[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [regeneratingId, setRegeneratingId] = useState<number | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [instructionDraft, setInstructionDraft] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fetchSummaries = async () => {
            try {
                const response = await fetch('/api/summaries');
                if (!response.ok) {
                    throw new Error('要約履歴の取得に失敗しました');
                }

                const data = await response.json() as Summary[];
                if (!cancelled) {
                    setSummaries(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
                }
            } finally {
                if (!cancelled) {
                    setLoadingList(false);
                }
            }
        };

        fetchSummaries();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmed = originalText.trim();
        if (!trimmed) {
            setError('要約する原文を入力してください');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/summaries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({originalText: trimmed}),
            });

            if (!response.ok) {
                throw new Error('要約の生成に失敗しました');
            }

            const createdSummary = await response.json() as Summary;
            setSummaries((prev) => [createdSummary, ...prev]);
            setOriginalText('');
        } catch (err) {
            setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRegenerate = async (summaryId: number) => {
        setRegeneratingId(summaryId);
        setError(null);

        try {
            const response = await fetch(`/api/summaries/${summaryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({instruction: instructionDraft}),
            });

            if (!response.ok) {
                throw new Error('要約の再生成に失敗しました');
            }

            const updatedSummary = await response.json() as Summary;
            setSummaries((prev) => prev.map((summary) => summary.id === summaryId ? updatedSummary : summary));
            setExpandedId(null);
            setInstructionDraft('');
        } catch (err) {
            setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
        } finally {
            setRegeneratingId(null);
        }
    };

    return (
        <div
            className="font-sans min-h-[calc(100vh-4rem)] bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800"
        >
            <main className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
                <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">AI要約</h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <textarea
                            className="w-full h-40 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                            placeholder="要約したい原文を入力してください"
                            value={originalText}
                            onChange={(event) => setOriginalText(event.target.value)}
                            disabled={submitting}
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            {submitting ? '要約中...' : '要約する'}
                        </button>
                    </form>
                </section>

                {error && (
                    <div className="text-red-600 dark:text-red-300 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        エラー: {error}
                    </div>
                )}

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">要約履歴</h2>

                    {loadingList ? (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            読み込み中...
                        </div>
                    ) : summaries.length === 0 ? (
                        <div className="text-gray-600 dark:text-gray-300">要約履歴はまだありません。</div>
                    ) : (
                        <ul className="space-y-4">
                            {summaries.map((summary) => (
                                <li key={summary.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">要約文</p>
                                        <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{summary.summaryText}</p>
                                    </div>

                                    <details>
                                        <summary className="cursor-pointer text-sm text-blue-600 dark:text-blue-300">
                                            原文を表示
                                        </summary>
                                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                                            {summary.originalText}
                                        </p>
                                    </details>

                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        作成: {formatDate(summary.createdAt)} / 更新: {formatDate(summary.updatedAt)} / モデル: {summary.model}
                                    </div>

                                    <div className="space-y-2">
                                        {expandedId === summary.id ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={instructionDraft}
                                                    onChange={(event) => setInstructionDraft(event.target.value)}
                                                    placeholder="再生成の指示（任意）"
                                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setExpandedId(null);
                                                            setInstructionDraft('');
                                                        }}
                                                        className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                                                    >
                                                        キャンセル
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={regeneratingId === summary.id}
                                                        onClick={() => handleRegenerate(summary.id)}
                                                        className="px-3 py-2 rounded text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
                                                    >
                                                        {regeneratingId === summary.id ? '再生成中...' : '再生成を実行'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setExpandedId(summary.id);
                                                    setInstructionDraft(summary.instruction || '');
                                                }}
                                                className="px-3 py-2 rounded text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                再生成
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>
        </div>
    );
}
