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
     * @param {SeedApi.oauthClientCredentialsCustom.GetTokenWithClientCredentialsAuthRequest} request
     * @param {AuthClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.oauthClientCredentialsCustom.auth.getTokenWithClientCredentials({
     *         cid: "cid",
     *         csr: "csr",
     *         scp: "scp",
     *         entity_id: "entity_id",
     *         audience: "https://api.example.com",
     *         grant_type: "client_credentials"
     *     })
     */
    getTokenWithClientCredentials(request: SeedApi.oauthClientCredentialsCustom.GetTokenWithClientCredentialsAuthRequest, requestOptions?: AuthClient.RequestOptions): core.HttpResponsePromise<SeedApi.oauthClientCredentialsCustom.TokenResponse>;
    private __getTokenWithClientCredentials;
    /**
     * @param {SeedApi.oauthClientCredentialsCustom.RefreshTokenAuthRequest} request
     * @param {AuthClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.oauthClientCredentialsCustom.auth.refreshToken({
     *         client_id: "client_id",
     *         client_secret: "client_secret",
     *         refresh_token: "refresh_token",
     *         audience: "https://api.example.com",
     *         grant_type: "refresh_token"
     *     })
     */
    refreshToken(request: SeedApi.oauthClientCredentialsCustom.RefreshTokenAuthRequest, requestOptions?: AuthClient.RequestOptions): core.HttpResponsePromise<SeedApi.oauthClientCredentialsCustom.TokenResponse>;
    private __refreshToken;
}
