import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.js";
import * as core from "../../../../core/index.js";
export declare namespace NoAuth {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class NoAuth {
    protected readonly _options: NoAuth.Options;
    constructor(_options: NoAuth.Options);
    /**
     * POST request with no auth
     *
     * @param {unknown} request
     * @param {NoAuth.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedExhaustive.BadRequestBody}
     *
     * @example
     *     await client.noAuth.postWithNoAuth({
     *         "key": "value"
     *     })
     */
    postWithNoAuth(request?: unknown, requestOptions?: NoAuth.RequestOptions): core.HttpResponsePromise<boolean>;
    private __postWithNoAuth;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
