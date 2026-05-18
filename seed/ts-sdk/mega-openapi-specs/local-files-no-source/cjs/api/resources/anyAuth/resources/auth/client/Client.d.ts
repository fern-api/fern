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
     * @param {SeedApi.anyAuth.GetTokenAuthRequest} request
     * @param {AuthClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.anyAuth.auth.getToken({
     *         client_id: "client_id",
     *         client_secret: "client_secret",
     *         audience: "https://api.example.com",
     *         grant_type: "client_credentials"
     *     })
     */
    getToken(request: SeedApi.anyAuth.GetTokenAuthRequest, requestOptions?: AuthClient.RequestOptions): core.HttpResponsePromise<SeedApi.anyAuth.TokenResponse>;
    private __getToken;
}
