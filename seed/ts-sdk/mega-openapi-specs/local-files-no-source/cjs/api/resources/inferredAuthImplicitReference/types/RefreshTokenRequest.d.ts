/**
 * A request to refresh an OAuth token.
 */
export interface RefreshTokenRequest {
    client_id: string;
    client_secret: string;
    refresh_token: string;
    audience: RefreshTokenRequest.Audience;
    grant_type: RefreshTokenRequest.GrantType;
    scope?: (string | null) | undefined;
}
export declare namespace RefreshTokenRequest {
    const Audience: {
        readonly HttpsApiExampleCom: "https://api.example.com";
    };
    type Audience = (typeof Audience)[keyof typeof Audience];
    const GrantType: {
        readonly RefreshToken: "refresh_token";
    };
    type GrantType = (typeof GrantType)[keyof typeof GrantType];
}
