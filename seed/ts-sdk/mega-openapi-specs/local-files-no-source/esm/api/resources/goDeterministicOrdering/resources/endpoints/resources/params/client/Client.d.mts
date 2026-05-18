import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../../../BaseClient.mjs";
import * as core from "../../../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../../../index.mjs";
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
     * @param {SeedApi.goDeterministicOrdering.endpoints.GetWithPathParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.params.getWithPath({
     *         param: "param"
     *     })
     */
    getWithPath(request: SeedApi.goDeterministicOrdering.endpoints.GetWithPathParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getWithPath;
    /**
     * POST bytes with path param returning object
     *
     * @param {core.file.Uploadable} uploadable
     * @param {string} param
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     */
    uploadWithPath(uploadable: core.file.Uploadable, param: string, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.TypesObjectWithRequiredField>;
    private __uploadWithPath;
    /**
     * PUT to update with path param
     *
     * @param {SeedApi.goDeterministicOrdering.endpoints.ModifyWithPathParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.params.modifyWithPath({
     *         param: "param",
     *         body: "string"
     *     })
     */
    modifyWithPath(request: SeedApi.goDeterministicOrdering.endpoints.ModifyWithPathParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __modifyWithPath;
    /**
     * GET with path param
     *
     * @param {SeedApi.goDeterministicOrdering.endpoints.GetWithInlinePathParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.params.getWithInlinePath({
     *         param: "param"
     *     })
     */
    getWithInlinePath(request: SeedApi.goDeterministicOrdering.endpoints.GetWithInlinePathParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getWithInlinePath;
    /**
     * PUT to update with path param
     *
     * @param {SeedApi.goDeterministicOrdering.endpoints.ModifyWithInlinePathParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.params.modifyWithInlinePath({
     *         param: "param",
     *         body: "string"
     *     })
     */
    modifyWithInlinePath(request: SeedApi.goDeterministicOrdering.endpoints.ModifyWithInlinePathParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __modifyWithInlinePath;
    /**
     * GET with query param
     *
     * @param {SeedApi.goDeterministicOrdering.endpoints.GetWithQueryParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.params.getWithQuery({
     *         query: "query",
     *         number: 1
     *     })
     */
    getWithQuery(request: SeedApi.goDeterministicOrdering.endpoints.GetWithQueryParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithQuery;
    /**
     * GET with multiple of same query param
     *
     * @param {SeedApi.goDeterministicOrdering.endpoints.GetWithAllowMultipleQueryParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.params.getWithAllowMultipleQuery({
     *         query: ["query"],
     *         number: [1]
     *     })
     */
    getWithAllowMultipleQuery(request?: SeedApi.goDeterministicOrdering.endpoints.GetWithAllowMultipleQueryParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithAllowMultipleQuery;
    /**
     * GET with path and query params
     *
     * @param {SeedApi.goDeterministicOrdering.endpoints.GetWithPathAndQueryParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.params.getWithPathAndQuery({
     *         param: "param",
     *         query: "query"
     *     })
     */
    getWithPathAndQuery(request: SeedApi.goDeterministicOrdering.endpoints.GetWithPathAndQueryParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithPathAndQuery;
    /**
     * GET with path and query params
     *
     * @param {SeedApi.goDeterministicOrdering.endpoints.GetWithInlinePathAndQueryParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.params.getWithInlinePathAndQuery({
     *         param: "param",
     *         query: "query"
     *     })
     */
    getWithInlinePathAndQuery(request: SeedApi.goDeterministicOrdering.endpoints.GetWithInlinePathAndQueryParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithInlinePathAndQuery;
}
