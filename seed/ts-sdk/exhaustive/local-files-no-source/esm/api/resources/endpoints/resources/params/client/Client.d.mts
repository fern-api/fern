import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedExhaustive from "../../../../../index.mjs";
export declare namespace ParamsClient {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ParamsClient {
    protected readonly _options: ParamsClient.Options;
    constructor(options: ParamsClient.Options);
    /**
     * GET with path param
     *
     * @param {string} param
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithPath("param")
     */
    getWithPath(param: string, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getWithPath;
    /**
     * GET with path param
     *
     * @param {SeedExhaustive.endpoints.GetWithInlinePath} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithInlinePath({
     *         param: "param"
     *     })
     */
    getWithInlinePath(request: SeedExhaustive.endpoints.GetWithInlinePath, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getWithInlinePath;
    /**
     * GET with query param
     *
     * @param {SeedExhaustive.endpoints.GetWithQuery} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithQuery({
     *         query: "query",
     *         number: 1
     *     })
     */
    getWithQuery(request: SeedExhaustive.endpoints.GetWithQuery, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithQuery;
    /**
     * GET with multiple of same query param
     *
     * @param {SeedExhaustive.endpoints.GetWithMultipleQuery} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithAllowMultipleQuery({
     *         query: "query",
     *         number: 1
     *     })
     */
    getWithAllowMultipleQuery(request: SeedExhaustive.endpoints.GetWithMultipleQuery, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithAllowMultipleQuery;
    /**
     * GET with path and query params
     *
     * @param {string} param
     * @param {SeedExhaustive.endpoints.GetWithPathAndQuery} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithPathAndQuery("param", {
     *         query: "query"
     *     })
     */
    getWithPathAndQuery(param: string, request: SeedExhaustive.endpoints.GetWithPathAndQuery, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithPathAndQuery;
    /**
     * GET with path and query params
     *
     * @param {SeedExhaustive.endpoints.GetWithInlinePathAndQuery} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithInlinePathAndQuery({
     *         param: "param",
     *         query: "query"
     *     })
     */
    getWithInlinePathAndQuery(request: SeedExhaustive.endpoints.GetWithInlinePathAndQuery, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithInlinePathAndQuery;
    /**
     * PUT to update with path param
     *
     * @param {string} param
     * @param {string} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.modifyWithPath("param", "string")
     */
    modifyWithPath(param: string, request: string, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __modifyWithPath;
    /**
     * PUT to update with path param
     *
     * @param {SeedExhaustive.endpoints.ModifyResourceAtInlinedPath} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.modifyWithInlinePath({
     *         param: "param",
     *         body: "string"
     *     })
     */
    modifyWithInlinePath(request: SeedExhaustive.endpoints.ModifyResourceAtInlinedPath, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __modifyWithInlinePath;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
