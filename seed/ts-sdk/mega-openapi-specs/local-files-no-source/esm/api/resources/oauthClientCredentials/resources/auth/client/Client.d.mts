import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace AuthClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class AuthClient {
    protected readonly _options: NormalizedClientOptions<AuthClient.Options>;
    constructor(options: AuthClient.Options);
    /**
     * @param {SeedApi.oauthClientCredentials.GetTokenWithClientCredentialsAuthRequest} request
     * @param {AuthClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.oauthClientCredentials.auth.getTokenWithClientCredentials({
     *         client_id: "my_oauth_app_123",
     *         client_secret: "sk_live_abcdef123456789",
     *         audience: "https://api.example.com",
     *         grant_type: "client_credentials",
     *         scope: "read:users"
     *     })
     */
    getTokenWithClientCredentials(request: SeedApi.oauthClientCredentials.GetTokenWithClientCredentialsAuthRequest, requestOptions?: AuthClient.RequestOptions): core.HttpResponsePromise<SeedApi.oauthClientCredentials.TokenResponse>;
    private __getTokenWithClientCredentials;
    /**
     * @param {SeedApi.oauthClientCredentials.RefreshTokenAuthRequest} request
     * @param {AuthClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.oauthClientCredentials.auth.refreshToken({
     *         client_id: "my_oauth_app_123",
     *         client_secret: "sk_live_abcdef123456789",
     *         refresh_token: "refresh_token",
     *         audience: "https://api.example.com",
     *         grant_type: "refresh_token",
     *         scope: "read:users"
     *     })
     */
    refreshToken(request: SeedApi.oauthClientCredentials.RefreshTokenAuthRequest, requestOptions?: AuthClient.RequestOptions): core.HttpResponsePromise<SeedApi.oauthClientCredentials.TokenResponse>;
    private __refreshToken;
}
