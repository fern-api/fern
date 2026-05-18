import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../../../BaseClient.js";
import * as core from "../../../../../../../../core/index.js";
import * as SeedApi from "../../../../../../../index.js";
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
     * @param {SeedApi.exhaustive.endpoints.GetWithPathParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.params.getWithPath({
     *         param: "param"
     *     })
     */
    getWithPath(request: SeedApi.exhaustive.endpoints.GetWithPathParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getWithPath;
    /**
     * POST bytes with path param returning object
     *
     * @param {core.file.Uploadable} uploadable
     * @param {string} param
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     */
    uploadWithPath(uploadable: core.file.Uploadable, param: string, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<SeedApi.exhaustive.TypesObjectWithRequiredField>;
    private __uploadWithPath;
    /**
     * PUT to update with path param
     *
     * @param {SeedApi.exhaustive.endpoints.ModifyWithPathParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.params.modifyWithPath({
     *         param: "param",
     *         body: "string"
     *     })
     */
    modifyWithPath(request: SeedApi.exhaustive.endpoints.ModifyWithPathParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __modifyWithPath;
    /**
     * GET with path param
     *
     * @param {SeedApi.exhaustive.endpoints.GetWithInlinePathParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.params.getWithInlinePath({
     *         param: "param"
     *     })
     */
    getWithInlinePath(request: SeedApi.exhaustive.endpoints.GetWithInlinePathParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getWithInlinePath;
    /**
     * PUT to update with path param
     *
     * @param {SeedApi.exhaustive.endpoints.ModifyWithInlinePathParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.params.modifyWithInlinePath({
     *         param: "param",
     *         body: "string"
     *     })
     */
    modifyWithInlinePath(request: SeedApi.exhaustive.endpoints.ModifyWithInlinePathParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __modifyWithInlinePath;
    /**
     * GET with query param
     *
     * @param {SeedApi.exhaustive.endpoints.GetWithQueryParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.params.getWithQuery({
     *         query: "query",
     *         number: 1
     *     })
     */
    getWithQuery(request: SeedApi.exhaustive.endpoints.GetWithQueryParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithQuery;
    /**
     * GET with multiple of same query param
     *
     * @param {SeedApi.exhaustive.endpoints.GetWithAllowMultipleQueryParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.params.getWithAllowMultipleQuery({
     *         query: ["query"],
     *         number: [1]
     *     })
     */
    getWithAllowMultipleQuery(request?: SeedApi.exhaustive.endpoints.GetWithAllowMultipleQueryParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithAllowMultipleQuery;
    /**
     * GET with path and query params
     *
     * @param {SeedApi.exhaustive.endpoints.GetWithPathAndQueryParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.params.getWithPathAndQuery({
     *         param: "param",
     *         query: "query"
     *     })
     */
    getWithPathAndQuery(request: SeedApi.exhaustive.endpoints.GetWithPathAndQueryParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithPathAndQuery;
    /**
     * GET with path and query params
     *
     * @param {SeedApi.exhaustive.endpoints.GetWithInlinePathAndQueryParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.params.getWithInlinePathAndQuery({
     *         param: "param",
     *         query: "query"
     *     })
     */
    getWithInlinePathAndQuery(request: SeedApi.exhaustive.endpoints.GetWithInlinePathAndQueryParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getWithInlinePathAndQuery;
    /**
     * GET with boolean path param
     *
     * @param {SeedApi.exhaustive.endpoints.GetWithBooleanPathParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.params.getWithBooleanPath({
     *         param: true
     *     })
     */
    getWithBooleanPath(request: SeedApi.exhaustive.endpoints.GetWithBooleanPathParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getWithBooleanPath;
    /**
     * GET with path param that can throw errors
     *
     * @param {SeedApi.exhaustive.endpoints.GetWithPathAndErrorsParamsRequest} request
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.exhaustive.BadRequestError}
     *
     * @example
     *     await client.exhaustive.endpoints.params.getWithPathAndErrors({
     *         param: "param"
     *     })
     */
    getWithPathAndErrors(request: SeedApi.exhaustive.endpoints.GetWithPathAndErrorsParamsRequest, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getWithPathAndErrors;
}
