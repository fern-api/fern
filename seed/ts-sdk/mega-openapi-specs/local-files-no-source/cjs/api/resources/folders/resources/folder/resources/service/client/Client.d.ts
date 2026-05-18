import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../../../BaseClient.js";
import * as core from "../../../../../../../../core/index.js";
export declare namespace ServiceClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ServiceClient {
    protected readonly _options: NormalizedClientOptions<ServiceClient.Options>;
    constructor(options: ServiceClient.Options);
    /**
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.folders.folder.service.endpoint()
     */
    endpoint(requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __endpoint;
    /**
     * @param {unknown} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.folders.NotFoundError}
     *
     * @example
     *     await client.folders.folder.service.unknownRequest({
     *         "key": "value"
     *     })
     */
    unknownRequest(request?: unknown, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __unknownRequest;
}
