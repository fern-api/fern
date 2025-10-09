const BEARER_AUTH_HEADER_PREFIX = /^Bearer /i;
export const BearerToken = {
    toAuthorizationHeader: (token) => {
        if (token == null) {
            return undefined;
        }
        return `Bearer ${token}`;
    },
    fromAuthorizationHeader: (header) => {
        return header.replace(BEARER_AUTH_HEADER_PREFIX, "").trim();
    },
};
