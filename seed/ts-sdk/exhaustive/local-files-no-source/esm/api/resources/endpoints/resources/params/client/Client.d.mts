import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type { GetWithInlinePath } from "./requests/GetWithInlinePath.mjs";
import type { GetWithInlinePathAndQuery } from "./requests/GetWithInlinePathAndQuery.mjs";
import type { GetWithMultipleQuery } from "./requests/GetWithMultipleQuery.mjs";
import type { GetWithPathAndQuery } from "./requests/GetWithPathAndQuery.mjs";
import type { GetWithQuery } from "./requests/GetWithQuery.mjs";
import type { ModifyResourceAtInlinedPath } from "./requests/ModifyResourceAtInlinedPath.mjs";
export declare namespace Params {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class Params {
    protected readonly _options: Params.Options;
    constructor(_options: Params.Options);
    /**
     * GET with path param
     *
     * @param {string} param
     * @param {Params.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithPath("param")
     */
    getWithPath(param: string, requestOptions?: Params.RequestOptions): core.HttpResponsePromise<string>;
    private __getWithPath;
    /**
     * GET with path param
     *
     * @param {GetWithInlinePath} request
     * @param {Params.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithInlinePath({
     *         param: "param"
     *     })
     */
    getWithInlinePath(request: GetWithInlinePath, requestOptions?: Params.RequestOptions): core.HttpResponsePromise<string>;
    private __getWithInlinePath;
    /**
     * GET with query param
     *
     * @param {GetWithQuery} request
     * @param {Params.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithQuery({
     *         query: "query",
     *         number: 1
     *     })
     */
    getWithQuery(request: GetWithQuery, requestOptions?: Params.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithQuery;
    /**
     * GET with multiple of same query param
     *
     * @param {GetWithMultipleQuery} request
     * @param {Params.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithAllowMultipleQuery({
     *         query: "query",
     *         number: 1
     *     })
     */
    getWithAllowMultipleQuery(request: GetWithMultipleQuery, requestOptions?: Params.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithAllowMultipleQuery;
    /**
     * GET with path and query params
     *
     * @param {string} param
     * @param {GetWithPathAndQuery} request
     * @param {Params.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithPathAndQuery("param", {
     *         query: "query"
     *     })
     */
    getWithPathAndQuery(param: string, request: GetWithPathAndQuery, requestOptions?: Params.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithPathAndQuery;
    /**
     * GET with path and query params
     *
     * @param {GetWithInlinePathAndQuery} request
     * @param {Params.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithInlinePathAndQuery({
     *         param: "param",
     *         query: "query"
     *     })
     */
    getWithInlinePathAndQuery(request: GetWithInlinePathAndQuery, requestOptions?: Params.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithInlinePathAndQuery;
    /**
     * PUT to update with path param
     *
     * @param {string} param
     * @param {string} request
     * @param {Params.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.modifyWithPath("param", "string")
     */
    modifyWithPath(param: string, request: string, requestOptions?: Params.RequestOptions): core.HttpResponsePromise<string>;
    private __modifyWithPath;
    /**
     * PUT to update with path param
     *
     * @param {ModifyResourceAtInlinedPath} request
     * @param {Params.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.modifyWithInlinePath({
     *         param: "param",
     *         body: "string"
     *     })
     */
    modifyWithInlinePath(request: ModifyResourceAtInlinedPath, requestOptions?: Params.RequestOptions): core.HttpResponsePromise<string>;
    private __modifyWithInlinePath;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
