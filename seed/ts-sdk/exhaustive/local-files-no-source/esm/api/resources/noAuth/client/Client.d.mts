import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.mjs";
import * as core from "../../../../core/index.mjs";
export declare namespace NoAuthClient {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class NoAuthClient {
    protected readonly _options: NoAuthClient.Options;
    constructor(options: NoAuthClient.Options);
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
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
