/**
 * @example
 *     {
 *         client_id: "my_oauth_app_123",
 *         client_secret: "sk_live_abcdef123456789",
 *         audience: "https://api.example.com",
 *         grant_type: "client_credentials",
 *         scope: "read:users"
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
