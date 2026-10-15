"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodePathParam = encodePathParam;
function encodePathParam(param, InvalidPathParameterError) {
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
    const encoded = encodeURIComponent(param);
    // "." and ".." are dot segments: URL resolution would remove them and send the request to a different path.
    if (encoded === "." || encoded === "..") {
        const message = `Invalid path parameter "${encoded}": "." and ".." are not allowed because they change the request path.`;
        throw InvalidPathParameterError != null ? new InvalidPathParameterError({ message }) : new Error(message);
    }
    return encoded;
}
