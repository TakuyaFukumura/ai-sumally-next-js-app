export function isSameOriginRequest(request: Request): boolean {
    const requestOrigin = new URL(request.url).origin;
    const originHeader = request.headers.get('origin');

    if (originHeader) {
        return originHeader === requestOrigin;
    }

    const refererHeader = request.headers.get('referer');
    if (!refererHeader) {
        return false;
    }

    try {
        return new URL(refererHeader).origin === requestOrigin;
    } catch {
        return false;
    }
}
