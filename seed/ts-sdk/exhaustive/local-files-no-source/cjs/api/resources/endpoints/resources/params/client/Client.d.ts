import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace ParamsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ParamsClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<ParamsClient.Options>;
    constructor(options: ParamsClient.Options);
    /**
     * GET with path param
     *
     * @param {SeedApi.endpoints.GetWithPathParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithPath({
     *         param: "param"
     *     })
     */
    getWithPath(request: SeedApi.endpoints.GetWithPathParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getWithPath;
    /**
     * POST bytes with path param returning object
     *
     * @param {core.file.Uploadable} uploadable
     * @param {string} param
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     */
    uploadWithPath(uploadable: core.file.Uploadable, param: string, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithRequiredField>;
    private __uploadWithPath;
    /**
     * PUT to update with path param
     *
     * @param {SeedApi.endpoints.ModifyWithPathParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.modifyWithPath({
     *         param: "param",
     *         body: "string"
     *     })
     */
    modifyWithPath(request: SeedApi.endpoints.ModifyWithPathParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __modifyWithPath;
    /**
     * GET with path param
     *
     * @param {SeedApi.endpoints.GetWithInlinePathParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithInlinePath({
     *         param: "param"
     *     })
     */
    getWithInlinePath(request: SeedApi.endpoints.GetWithInlinePathParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getWithInlinePath;
    /**
     * PUT to update with path param
     *
     * @param {SeedApi.endpoints.ModifyWithInlinePathParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.modifyWithInlinePath({
     *         param: "param",
     *         body: "string"
     *     })
     */
    modifyWithInlinePath(request: SeedApi.endpoints.ModifyWithInlinePathParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __modifyWithInlinePath;
    /**
     * GET with query param
     *
     * @param {SeedApi.endpoints.GetWithQueryParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithQuery({
     *         query: "query",
     *         number: 1
     *     })
     */
    getWithQuery(request: SeedApi.endpoints.GetWithQueryParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithQuery;
    /**
     * GET with multiple of same query param
     *
     * @param {SeedApi.endpoints.GetWithAllowMultipleQueryParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithAllowMultipleQuery({
     *         query: ["query"],
     *         number: [1]
     *     })
     */
    getWithAllowMultipleQuery(request?: SeedApi.endpoints.GetWithAllowMultipleQueryParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithAllowMultipleQuery;
    /**
     * GET with path and query params
     *
     * @param {SeedApi.endpoints.GetWithPathAndQueryParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithPathAndQuery({
     *         param: "param",
     *         query: "query"
     *     })
     */
    getWithPathAndQuery(request: SeedApi.endpoints.GetWithPathAndQueryParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithPathAndQuery;
    /**
     * GET with path and query params
     *
     * @param {SeedApi.endpoints.GetWithInlinePathAndQueryParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithInlinePathAndQuery({
     *         param: "param",
     *         query: "query"
     *     })
     */
    getWithInlinePathAndQuery(request: SeedApi.endpoints.GetWithInlinePathAndQueryParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithInlinePathAndQuery;
}
