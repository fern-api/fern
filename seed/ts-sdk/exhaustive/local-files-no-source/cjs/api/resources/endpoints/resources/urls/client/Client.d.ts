import { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
export declare namespace Urls {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class Urls {
    protected readonly _options: Urls.Options;
    constructor(_options: Urls.Options);
    /**
     * @param {Urls.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.urls.withMixedCase()
     */
    withMixedCase(requestOptions?: Urls.RequestOptions): core.HttpResponsePromise<string>;
    private __withMixedCase;
    /**
     * @param {Urls.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.urls.noEndingSlash()
     */
    noEndingSlash(requestOptions?: Urls.RequestOptions): core.HttpResponsePromise<string>;
    private __noEndingSlash;
    /**
     * @param {Urls.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.urls.withEndingSlash()
     */
    withEndingSlash(requestOptions?: Urls.RequestOptions): core.HttpResponsePromise<string>;
    private __withEndingSlash;
    /**
     * @param {Urls.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.urls.withUnderscores()
     */
    withUnderscores(requestOptions?: Urls.RequestOptions): core.HttpResponsePromise<string>;
    private __withUnderscores;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
