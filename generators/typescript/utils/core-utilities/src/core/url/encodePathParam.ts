export function encodePathParam(param: unknown): string {
    if (param === null) {
        return "null";
    }
    const typeofParam = typeof param;
    switch (typeofParam) {
        case "undefined":
            return "undefined";
        case "string":
        case "number":
        case "boolean":
            break;
        default:
            param = String(param);
            break;
    }
    const encoded = encodeURIComponent(param as string | number | boolean);
    // "." and ".." are dot-segments that URL parsers resolve, which would change the request path.
    if (encoded === "." || encoded === "..") {
        throw new Error(`Invalid path parameter value "${encoded}": "." and ".." are not allowed.`);
    }
    return encoded;
}
