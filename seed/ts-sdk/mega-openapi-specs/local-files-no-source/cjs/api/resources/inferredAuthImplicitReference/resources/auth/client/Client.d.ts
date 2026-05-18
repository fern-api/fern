import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace AuthClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class AuthClient {
    protected readonly _options: NormalizedClientOptions<AuthClient.Options>;
    constructor(options: AuthClient.Options);
    /**
     * @param {SeedApi.inferredAuthImplicitReference.GetTokenRequest} request
     * @param {AuthClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.inferredAuthImplicitReference.auth.getTokenWithClientCredentials({
     *         client_id: "client_id",
     *         client_secret: "client_secret",
     *         audience: "https://api.example.com",
     *         grant_type: "client_credentials"
     *     })
     */
    getTokenWithClientCredentials(request: SeedApi.inferredAuthImplicitReference.GetTokenRequest, requestOptions?: AuthClient.RequestOptions): core.HttpResponsePromise<SeedApi.inferredAuthImplicitReference.TokenResponse>;
    private __getTokenWithClientCredentials;
    /**
     * @param {SeedApi.inferredAuthImplicitReference.RefreshTokenRequest} request
     * @param {AuthClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.inferredAuthImplicitReference.auth.refreshToken({
     *         client_id: "client_id",
     *         client_secret: "client_secret",
     *         refresh_token: "refresh_token",
     *         audience: "https://api.example.com",
     *         grant_type: "refresh_token"
     *     })
     */
    refreshToken(request: SeedApi.inferredAuthImplicitReference.RefreshTokenRequest, requestOptions?: AuthClient.RequestOptions): core.HttpResponsePromise<SeedApi.inferredAuthImplicitReference.TokenResponse>;
    private __refreshToken;
}
