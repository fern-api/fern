/**
 * @example
 *     {
 *         client_id: "client_id",
 *         client_secret: "client_secret",
 *         audience: "https://api.example.com",
 *         grant_type: "client_credentials"
 *     }
 */
export interface GetTokenRequest {
    client_id: string;
    client_secret: string;
    audience: GetTokenRequest.Audience;
    grant_type: GetTokenRequest.GrantType;
    scope?: string | null;
}
export declare namespace GetTokenRequest {
    const Audience: {
        readonly HttpsApiExampleCom: "https://api.example.com";
    };
    type Audience = (typeof Audience)[keyof typeof Audience];
    const GrantType: {
        readonly ClientCredentials: "client_credentials";
    };
    type GrantType = (typeof GrantType)[keyof typeof GrantType];
}
