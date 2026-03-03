import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import * as core from "../../../../core/index.js";
export declare namespace NoAuthClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class NoAuthClient {
    protected readonly _options: NormalizedClientOptions<NoAuthClient.Options>;
    protected readonly _client: core.HttpClient;
    constructor(options: NoAuthClient.Options, client: core.HttpClient);
    /**
     * POST request with no auth
     *
     * @param {unknown} request
     * @param {NoAuthClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedExhaustive.BadRequestBody}
     *
     * @example
     *     await client.noAuth.postWithNoAuth({
     *         "key": "value"
     *     })
     */
    postWithNoAuth(request?: unknown, requestOptions?: NoAuthClient.RequestOptions): core.HttpResponsePromise<boolean>;
    private __postWithNoAuth;
}
