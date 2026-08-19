"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BearerToken = void 0;
const BEARER_AUTH_HEADER_PREFIX = /^Bearer /i;
function toAuthorizationHeader(token) {
    if (token == null) {
        return undefined;
    }
    return `Bearer ${token}`;
}
exports.BearerToken = {
    toAuthorizationHeader: toAuthorizationHeader,
    fromAuthorizationHeader: (header) => {
        return header.replace(BEARER_AUTH_HEADER_PREFIX, "").trim();
    },
};
