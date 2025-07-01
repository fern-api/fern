export function joinUrl(base: string, ...segments: string[]): string {
    if (!base) {
        return "";
    }

    if (base.includes("://")) {
        let url: URL;
        try {
            url = new URL(base);
        } catch {
            // Fallback to path joining if URL is malformed
            return joinPath(base, ...segments);
        }

        for (const segment of segments) {
            const cleanSegment = trimSlashes(segment);
            if (cleanSegment) {
                url.pathname = joinPathSegments(url.pathname, cleanSegment);
            }
        }

        return url.toString();
    }

    return joinPath(base, ...segments);
}

function joinPath(base: string, ...segments: string[]): string {
    let result = base;

    for (const segment of segments) {
        const cleanSegment = trimSlashes(segment);
        if (cleanSegment) {
            result = joinPathSegments(result, cleanSegment);
        }
    }

    return result;
}

function joinPathSegments(left: string, right: string): string {
    if (left.endsWith("/")) {
        return left + right;
    }
    return left + "/" + right;
}

function trimSlashes(str: string): string {
    if (!str) return str;

    let start = str.startsWith("/") ? 1 : 0;
    let end = str.endsWith("/") ? str.length - 1 : str.length;

    return str.slice(start, end);
}
