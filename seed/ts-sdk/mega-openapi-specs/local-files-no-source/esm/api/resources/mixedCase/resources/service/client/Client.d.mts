import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace ServiceClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ServiceClient {
    protected readonly _options: NormalizedClientOptions<ServiceClient.Options>;
    constructor(options: ServiceClient.Options);
    /**
     * @param {SeedApi.mixedCase.GetResourceServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.mixedCase.service.getResource({
     *         ResourceID: "rsc-xyz"
     *     })
     */
    getResource(request: SeedApi.mixedCase.GetResourceServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.mixedCase.Resource>;
    private __getResource;
    /**
     * @param {SeedApi.mixedCase.ListResourcesServiceRequest} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.mixedCase.service.listResources({
     *         page_limit: 1,
     *         beforeDate: "2023-01-01"
     *     })
     */
    listResources(request: SeedApi.mixedCase.ListResourcesServiceRequest, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.mixedCase.Resource[]>;
    private __listResources;
}
