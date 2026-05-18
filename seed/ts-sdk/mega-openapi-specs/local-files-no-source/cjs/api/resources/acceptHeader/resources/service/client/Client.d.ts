import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
export declare namespace ServiceClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ServiceClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<ServiceClient.Options>;
    constructor(options: ServiceClient.Options);
    /**
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.acceptHeader.NotFoundError}
     *
     * @example
     *     await client.acceptHeader.service.endpoint()
     */
    endpoint(requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __endpoint;
}
