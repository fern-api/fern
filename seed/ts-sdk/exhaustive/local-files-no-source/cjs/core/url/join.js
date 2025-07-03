"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.join = join;
function join(base, ...segments) {
    if (!base) {
        return "";
    }
    if (base.includes("://")) {
        let url;
        try {
            url = new URL(base);
        }
        catch (_a) {
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
function joinPath(base, ...segments) {
    let result = base;
    for (const segment of segments) {
        const cleanSegment = trimSlashes(segment);
        if (cleanSegment) {
            result = joinPathSegments(result, cleanSegment);
        }
    }
    return result;
}
function joinPathSegments(left, right) {
    if (left.endsWith("/")) {
        return left + right;
    }
    return left + "/" + right;
}
function trimSlashes(str) {
    if (!str)
        return str;
    let start = str.startsWith("/") ? 1 : 0;
    let end = str.endsWith("/") ? str.length - 1 : str.length;
    return str.slice(start, end);
}
