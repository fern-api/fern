import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
export declare namespace UrlsClient {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class UrlsClient {
    protected readonly _options: UrlsClient.Options;
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
     * @param {UrlsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.urls.noEndingSlash()
     */
    noEndingSlash(requestOptions?: UrlsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __noEndingSlash;
    /**
     * @param {UrlsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.urls.withEndingSlash()
     */
    withEndingSlash(requestOptions?: UrlsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __withEndingSlash;
    /**
     * @param {UrlsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.urls.withUnderscores()
     */
    withUnderscores(requestOptions?: UrlsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __withUnderscores;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
