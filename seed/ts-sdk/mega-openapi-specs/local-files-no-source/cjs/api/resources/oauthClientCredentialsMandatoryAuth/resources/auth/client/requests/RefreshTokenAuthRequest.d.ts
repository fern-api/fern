/**
 * @example
 *     {
 *         client_id: "my_oauth_app_123",
 *         client_secret: "sk_live_abcdef123456789",
 *         refresh_token: "refresh_token",
 *         audience: "https://api.example.com",
 *         grant_type: "refresh_token",
 *         scope: "read:users"
 *     }
 */
export interface RefreshTokenAuthRequest {
    client_id: string;
    client_secret: string;
    refresh_token: string;
    audience: RefreshTokenAuthRequest.Audience;
    grant_type: RefreshTokenAuthRequest.GrantType;
    scope?: string | null;
}
export declare namespace RefreshTokenAuthRequest {
    const Audience: {
        readonly HttpsApiExampleCom: "https://api.example.com";
    };
    type Audience = (typeof Audience)[keyof typeof Audience];
    const GrantType: {
        readonly RefreshToken: "refresh_token";
    };
    type GrantType = (typeof GrantType)[keyof typeof GrantType];
}
