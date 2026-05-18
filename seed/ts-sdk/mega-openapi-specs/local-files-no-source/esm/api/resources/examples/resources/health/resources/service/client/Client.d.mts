import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../../../BaseClient.mjs";
import * as core from "../../../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../../../index.mjs";
export declare namespace ServiceClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ServiceClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<ServiceClient.Options>;
    constructor(options: ServiceClient.Options);
    /**
     * This endpoint checks the health of a resource.
     *
     * @param {SeedApi.examples.health.CheckServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.examples.health.service.check({
     *         id: "id-2sdx82h"
     *     })
     */
    check(request: SeedApi.examples.health.CheckServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<void>;
    private __check;
    /**
     * This endpoint checks the health of the service.
     *
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.examples.health.service.ping()
     */
    ping(requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<boolean>;
    private __ping;
}
