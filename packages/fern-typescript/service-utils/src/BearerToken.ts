export type BearerToken = string;

const BEARER_AUTH_HEADER_PREFIX = /^Bearer /i;

export const BearerToken = {
    fromAuthorizationHeader: (header: string): BearerToken => {
        return header.replace(BEARER_AUTH_HEADER_PREFIX, "").trim() as BearerToken;
    },
};
