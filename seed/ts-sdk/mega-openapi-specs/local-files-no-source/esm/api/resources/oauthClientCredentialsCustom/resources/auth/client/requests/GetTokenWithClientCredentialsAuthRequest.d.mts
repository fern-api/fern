/**
 * @example
 *     {
 *         cid: "cid",
 *         csr: "csr",
 *         scp: "scp",
 *         entity_id: "entity_id",
 *         audience: "https://api.example.com",
 *         grant_type: "client_credentials"
 *     }
 */
export interface GetTokenWithClientCredentialsAuthRequest {
    cid: string;
    csr: string;
    scp: string;
    entity_id: string;
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
