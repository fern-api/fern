import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import * as core from "../../../../core/index.js";
export declare namespace EndpointsUrLsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class EndpointsUrLsClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<EndpointsUrLsClient.Options>;
    constructor(options: EndpointsUrLsClient.Options);
    /**
     * @param {EndpointsUrLsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsUrLs.endpointsUrlsWithMixedCase()
     */
    endpointsUrlsWithMixedCase(requestOptions?: EndpointsUrLsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __endpointsUrlsWithMixedCase;
    /**
     * @param {EndpointsUrLsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsUrLs.endpointsUrlsNoEndingSlash()
     */
    endpointsUrlsNoEndingSlash(requestOptions?: EndpointsUrLsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __endpointsUrlsNoEndingSlash;
    /**
     * @param {EndpointsUrLsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsUrLs.endpointsUrlsWithEndingSlash()
     */
    endpointsUrlsWithEndingSlash(requestOptions?: EndpointsUrLsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __endpointsUrlsWithEndingSlash;
    /**
     * @param {EndpointsUrLsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsUrLs.endpointsUrlsWithUnderscores()
     */
    endpointsUrlsWithUnderscores(requestOptions?: EndpointsUrLsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __endpointsUrlsWithUnderscores;
}
