import {buildSummaryPrompt} from '../../lib/ollama';

describe('buildSummaryPrompt', () => {
    it('追加指示がない場合のプロンプトを生成する', () => {
        const prompt = buildSummaryPrompt('これは原文です。');

        expect(prompt).toContain('以下の文章を日本語で要約してください');
        expect(prompt).toContain('これは原文です。');
        expect(prompt).not.toContain('追加指示:');
    });

    it('追加指示がある場合のプロンプトを生成する', () => {
        const prompt = buildSummaryPrompt('これは原文です。', '箇条書きで');

        expect(prompt).toContain('追加指示: 箇条書きで');
        expect(prompt).toContain('これは原文です。');
    });
});
