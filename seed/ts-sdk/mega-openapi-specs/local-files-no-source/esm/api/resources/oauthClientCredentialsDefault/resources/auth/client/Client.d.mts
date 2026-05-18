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
     * @param {SeedApi.oauthClientCredentialsDefault.GetTokenAuthRequest} request
     * @param {AuthClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.oauthClientCredentialsDefault.auth.getToken({
     *         client_id: "client_id",
     *         client_secret: "client_secret",
     *         grant_type: "client_credentials"
     *     })
     */
    getToken(request: SeedApi.oauthClientCredentialsDefault.GetTokenAuthRequest, requestOptions?: AuthClient.RequestOptions): core.HttpResponsePromise<SeedApi.oauthClientCredentialsDefault.TokenResponse>;
    private __getToken;
}
