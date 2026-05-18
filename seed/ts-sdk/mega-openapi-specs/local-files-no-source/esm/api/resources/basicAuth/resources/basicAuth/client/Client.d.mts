import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
export declare namespace BasicAuthClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class BasicAuthClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<BasicAuthClient.Options>;
    constructor(options: BasicAuthClient.Options);
    /**
     * GET request with basic auth scheme
     *
     * @param {BasicAuthClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.basicAuth.UnauthorizedError}
     *
     * @example
     *     await client.basicAuth.basicAuth.getWithBasicAuth()
     */
    getWithBasicAuth(requestOptions?: BasicAuthClient.RequestOptions): core.HttpResponsePromise<boolean>;
    private __getWithBasicAuth;
    /**
     * POST request with basic auth scheme
     *
     * @param {unknown} request
     * @param {BasicAuthClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.basicAuth.BadRequestError}
     * @throws {@link SeedApi.basicAuth.UnauthorizedError}
     *
     * @example
     *     await client.basicAuth.basicAuth.postWithBasicAuth({
     *         "key": "value"
     *     })
     */
    postWithBasicAuth(request?: unknown, requestOptions?: BasicAuthClient.RequestOptions): core.HttpResponsePromise<boolean>;
    private __postWithBasicAuth;
}
