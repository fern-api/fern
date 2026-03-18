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
    constructor(options: UrlsClient.Options);
    /**
     * @param {UrlsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.urls.withMixedCase()
     */
    withMixedCase(requestOptions?: UrlsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __withMixedCase;
    /**
     * Build a standard Fetch `Request` object for the withMixedCase endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForWithMixedCase(requestOptions?: UrlsClient.RequestOptions): Promise<Request>;
    /**
     * @param {UrlsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.urls.noEndingSlash()
     */
    noEndingSlash(requestOptions?: UrlsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __noEndingSlash;
    /**
     * Build a standard Fetch `Request` object for the noEndingSlash endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForNoEndingSlash(requestOptions?: UrlsClient.RequestOptions): Promise<Request>;
    /**
     * @param {UrlsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.urls.withEndingSlash()
     */
    withEndingSlash(requestOptions?: UrlsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __withEndingSlash;
    /**
     * Build a standard Fetch `Request` object for the withEndingSlash endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForWithEndingSlash(requestOptions?: UrlsClient.RequestOptions): Promise<Request>;
    /**
     * @param {UrlsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.urls.withUnderscores()
     */
    withUnderscores(requestOptions?: UrlsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __withUnderscores;
    /**
     * Build a standard Fetch `Request` object for the withUnderscores endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForWithUnderscores(requestOptions?: UrlsClient.RequestOptions): Promise<Request>;
}
