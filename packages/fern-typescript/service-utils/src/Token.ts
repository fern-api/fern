export type Token = string & {
    __Token: void;
};

const BEARER_AUTH_HEADER_PREFIX = /^Bearer\s+/i;

export const Token = {
    of: (value: string): Token => value as Token,

    fromAuthorizationHeader: (header: string): Token => {
        return header.replace(BEARER_AUTH_HEADER_PREFIX, "") as Token;
    },
};
