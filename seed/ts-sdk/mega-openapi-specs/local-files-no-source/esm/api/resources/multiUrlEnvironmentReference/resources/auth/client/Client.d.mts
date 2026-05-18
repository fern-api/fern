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
     * @param {SeedApi.multiUrlEnvironmentReference.AuthGetTokenRequest} request
     * @param {AuthClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.multiUrlEnvironmentReference.auth.gettoken({
     *         client_id: "client_id",
     *         client_secret: "client_secret"
     *     })
     */
    gettoken(request: SeedApi.multiUrlEnvironmentReference.AuthGetTokenRequest, requestOptions?: AuthClient.RequestOptions): core.HttpResponsePromise<SeedApi.multiUrlEnvironmentReference.AuthGetTokenResponse>;
    private __gettoken;
}
