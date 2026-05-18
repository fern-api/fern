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
     * @param {SeedApi.inferredAuthImplicit.GetTokenWithClientCredentialsAuthRequest} request
     * @param {AuthClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.inferredAuthImplicit.auth.getTokenWithClientCredentials({
     *         client_id: "client_id",
     *         client_secret: "client_secret",
     *         audience: "https://api.example.com",
     *         grant_type: "client_credentials"
     *     })
     */
    getTokenWithClientCredentials(request: SeedApi.inferredAuthImplicit.GetTokenWithClientCredentialsAuthRequest, requestOptions?: AuthClient.RequestOptions): core.HttpResponsePromise<SeedApi.inferredAuthImplicit.TokenResponse>;
    private __getTokenWithClientCredentials;
    /**
     * @param {SeedApi.inferredAuthImplicit.RefreshTokenAuthRequest} request
     * @param {AuthClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.inferredAuthImplicit.auth.refreshToken({
     *         client_id: "client_id",
     *         client_secret: "client_secret",
     *         refresh_token: "refresh_token",
     *         audience: "https://api.example.com",
     *         grant_type: "refresh_token"
     *     })
     */
    refreshToken(request: SeedApi.inferredAuthImplicit.RefreshTokenAuthRequest, requestOptions?: AuthClient.RequestOptions): core.HttpResponsePromise<SeedApi.inferredAuthImplicit.TokenResponse>;
    private __refreshToken;
}
