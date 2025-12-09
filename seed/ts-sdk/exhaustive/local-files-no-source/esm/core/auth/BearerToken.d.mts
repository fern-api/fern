export type BearerToken = string;
declare function toAuthorizationHeader(token: string | undefined): string | undefined;
export declare const BearerToken: {
    toAuthorizationHeader: typeof toAuthorizationHeader;
    fromAuthorizationHeader: (header: string) => BearerToken;
};
export {};
