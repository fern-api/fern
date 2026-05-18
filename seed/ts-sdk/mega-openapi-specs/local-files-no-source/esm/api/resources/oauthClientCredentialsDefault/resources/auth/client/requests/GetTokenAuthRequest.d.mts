/**
 * @example
 *     {
 *         client_id: "client_id",
 *         client_secret: "client_secret",
 *         grant_type: "client_credentials"
 *     }
 */
export interface GetTokenAuthRequest {
    client_id: string;
    client_secret: string;
    grant_type: GetTokenAuthRequest.GrantType;
}
export declare namespace GetTokenAuthRequest {
    const GrantType: {
        readonly ClientCredentials: "client_credentials";
    };
    type GrantType = (typeof GrantType)[keyof typeof GrantType];
}
