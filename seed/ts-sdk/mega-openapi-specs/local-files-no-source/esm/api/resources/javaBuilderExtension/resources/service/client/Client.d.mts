import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
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
     * @example
     *     await client.javaBuilderExtension.service.hello()
     */
    hello(requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaBuilderExtension.HelloResponse>;
    private __hello;
}
