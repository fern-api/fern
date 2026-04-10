import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import * as core from "../../../../core/index.mjs";
export declare namespace NoauthClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class NoauthClient {
    protected readonly _options: NormalizedClientOptions<NoauthClient.Options>;
    constructor(options: NoauthClient.Options);
    /**
     * POST request with no auth
     *
     * @param {unknown} request
     * @param {NoauthClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.BadRequestError}
     *
     * @example
     *     await client.noauth.postwithnoauth({
     *         "key": "value"
     *     })
     */
    postwithnoauth(request?: unknown, requestOptions?: NoauthClient.RequestOptions): core.HttpResponsePromise<boolean>;
    private __postwithnoauth;
}
