import {isSameOriginRequest} from '../../lib/security';

function createRequestMock(url: string, headers: Record<string, string>): Request {
    return {
        url,
        headers: {
            get: (name: string) => headers[name.toLowerCase()] ?? null,
        },
    } as unknown as Request;
}

describe('isSameOriginRequest', () => {
    it('Originヘッダーが同じならtrueを返す', () => {
        const request = createRequestMock('http://localhost:3000/api/summaries', {
            origin: 'http://localhost:3000',
        });

        expect(isSameOriginRequest(request)).toBe(true);
    });

    it('Originヘッダーが異なるならfalseを返す', () => {
        const request = createRequestMock('http://localhost:3000/api/summaries', {
            origin: 'http://malicious.example',
        });

        expect(isSameOriginRequest(request)).toBe(false);
    });

    it('Refererヘッダーが同一オリジンならtrueを返す', () => {
        const request = createRequestMock('http://localhost:3000/api/summaries', {
            referer: 'http://localhost:3000/summaries',
        });

        expect(isSameOriginRequest(request)).toBe(true);
    });

    it('Refererヘッダーがクロスオリジンならfalseを返す', () => {
        const request = createRequestMock('http://localhost:3000/api/summaries', {
            referer: 'http://malicious.example/summaries',
        });
        expect(isSameOriginRequest(request)).toBe(false);
    });

    it('OriginとRefererがない場合はfalseを返す', () => {
        const request = createRequestMock('http://localhost:3000/api/summaries', {});
        expect(isSameOriginRequest(request)).toBe(false);
    });
});
