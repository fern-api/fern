import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
export declare namespace UrlsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class UrlsClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<UrlsClient.Options>;
    protected readonly _client: core.HttpClient;
    constructor(options: UrlsClient.Options, client?: core.HttpClient);
    /**
     * @param {UrlsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.urls.withMixedCase()
     */
    withMixedCase(requestOptions?: UrlsClient.RequestOptions): core.HttpResponsePromise<string>;
    /**
     * @param {UrlsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.urls.noEndingSlash()
     */
    noEndingSlash(requestOptions?: UrlsClient.RequestOptions): core.HttpResponsePromise<string>;
    /**
     * @param {UrlsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.urls.withEndingSlash()
     */
    withEndingSlash(requestOptions?: UrlsClient.RequestOptions): core.HttpResponsePromise<string>;
    /**
     * @param {UrlsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.urls.withUnderscores()
     */
    withUnderscores(requestOptions?: UrlsClient.RequestOptions): core.HttpResponsePromise<string>;
}
