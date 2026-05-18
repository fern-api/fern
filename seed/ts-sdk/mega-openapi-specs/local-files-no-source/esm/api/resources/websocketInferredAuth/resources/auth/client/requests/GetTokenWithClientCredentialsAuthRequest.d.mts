/**
 * @example
 *     {
 *         client_id: "client_id",
 *         client_secret: "client_secret",
 *         audience: "https://api.example.com",
 *         grant_type: "client_credentials"
 *     }
 */
export interface GetTokenWithClientCredentialsAuthRequest {
    client_id: string;
    client_secret: string;
    audience: GetTokenWithClientCredentialsAuthRequest.Audience;
    grant_type: GetTokenWithClientCredentialsAuthRequest.GrantType;
    scope?: string | null;
}
export declare namespace GetTokenWithClientCredentialsAuthRequest {
    const Audience: {
        readonly HttpsApiExampleCom: "https://api.example.com";
    };
    type Audience = (typeof Audience)[keyof typeof Audience];
    const GrantType: {
        readonly ClientCredentials: "client_credentials";
    };
    type GrantType = (typeof GrantType)[keyof typeof GrantType];
}
