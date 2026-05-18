import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace IdentityClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class IdentityClient {
    protected readonly _options: NormalizedClientOptions<IdentityClient.Options>;
    constructor(options: IdentityClient.Options);
    /**
     * @param {SeedApi.oauthClientCredentialsOpenapi.GetTokenIdentityRequest} request
     * @param {IdentityClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.oauthClientCredentialsOpenapi.identity.getToken({
     *         username: "username",
     *         password: "password"
     *     })
     */
    getToken(request: SeedApi.oauthClientCredentialsOpenapi.GetTokenIdentityRequest, requestOptions?: IdentityClient.RequestOptions): core.HttpResponsePromise<SeedApi.oauthClientCredentialsOpenapi.TokenResponse>;
    private __getToken;
}
