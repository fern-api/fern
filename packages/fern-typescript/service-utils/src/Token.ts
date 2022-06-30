export type Token = string & {
    __Token: void;
};

const BEARER_AUTH_HEADER_PREFIX = /^Bearer /i;

export const Token = {
    of: (value: string): Token => value as Token,

    fromAuthorizationHeader: (header: string): Token => {
        return header.replace(BEARER_AUTH_HEADER_PREFIX, "").trim() as Token;
    },
};
