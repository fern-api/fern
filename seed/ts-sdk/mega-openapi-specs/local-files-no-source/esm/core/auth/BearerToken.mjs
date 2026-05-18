const BEARER_AUTH_HEADER_PREFIX = /^Bearer /i;
function toAuthorizationHeader(token) {
    if (token == null) {
        return undefined;
    }
    return `Bearer ${token}`;
}
export const BearerToken = {
    toAuthorizationHeader: toAuthorizationHeader,
    fromAuthorizationHeader: (header) => {
        return header.replace(BEARER_AUTH_HEADER_PREFIX, "").trim();
    },
};
