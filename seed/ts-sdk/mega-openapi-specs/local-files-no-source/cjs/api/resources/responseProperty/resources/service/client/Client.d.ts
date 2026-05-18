import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace ServiceClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ServiceClient {
    protected readonly _options: NormalizedClientOptions<ServiceClient.Options>;
    constructor(options: ServiceClient.Options);
    /**
     * @param {string} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.responseProperty.service.getMovie("string")
     */
    getMovie(request: string, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.responseProperty.Response>;
    private __getMovie;
    /**
     * @param {string} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.responseProperty.service.getMovieDocs("string")
     */
    getMovieDocs(request: string, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.responseProperty.Response>;
    private __getMovieDocs;
    /**
     * @param {string} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.responseProperty.service.getMovieName("string")
     */
    getMovieName(request: string, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.responseProperty.StringResponse>;
    private __getMovieName;
    /**
     * @param {string} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.responseProperty.service.getMovieMetadata("string")
     */
    getMovieMetadata(request: string, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.responseProperty.Response>;
    private __getMovieMetadata;
    /**
     * @param {string} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.responseProperty.service.getOptionalMovie("string")
     */
    getOptionalMovie(request: string, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.responseProperty.Response | null>;
    private __getOptionalMovie;
    /**
     * @param {string} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.responseProperty.service.getOptionalMovieDocs("string")
     */
    getOptionalMovieDocs(request: string, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.responseProperty.OptionalWithDocs | null>;
    private __getOptionalMovieDocs;
    /**
     * @param {string} request
     * @param {ServiceClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.responseProperty.service.getOptionalMovieName("string")
     */
    getOptionalMovieName(request: string, requestOptions?: ServiceClient.RequestOptions): core.HttpResponsePromise<SeedApi.responseProperty.OptionalStringResponse | null>;
    private __getOptionalMovieName;
}
