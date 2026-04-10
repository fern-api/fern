import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import * as core from "../../../../core/index.mjs";
import * as SeedApi from "../../../index.mjs";
export declare namespace EndpointsParamsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class EndpointsParamsClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<EndpointsParamsClient.Options>;
    constructor(options: EndpointsParamsClient.Options);
    /**
     * GET with path param
     *
     * @param {SeedApi.EndpointsParamsGetWithPathRequest} request
     * @param {EndpointsParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsParams.endpointsParamsGetWithPath({
     *         param: "param"
     *     })
     */
    endpointsParamsGetWithPath(request: SeedApi.EndpointsParamsGetWithPathRequest, requestOptions?: EndpointsParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __endpointsParamsGetWithPath;
    /**
     * POST bytes with path param returning object
     *
     * @param {core.file.Uploadable} uploadable
     * @param {string} param
     * @param {EndpointsParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     */
    endpointsParamsUploadWithPath(uploadable: core.file.Uploadable, param: string, requestOptions?: EndpointsParamsClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithRequiredField>;
    private __endpointsParamsUploadWithPath;
    /**
     * PUT to update with path param
     *
     * @param {SeedApi.EndpointsParamsModifyWithPathRequest} request
     * @param {EndpointsParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsParams.endpointsParamsModifyWithPath({
     *         param: "param",
     *         body: "string"
     *     })
     */
    endpointsParamsModifyWithPath(request: SeedApi.EndpointsParamsModifyWithPathRequest, requestOptions?: EndpointsParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __endpointsParamsModifyWithPath;
    /**
     * GET with path param
     *
     * @param {SeedApi.EndpointsParamsGetWithInlinePathRequest} request
     * @param {EndpointsParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsParams.endpointsParamsGetWithInlinePath({
     *         param: "param"
     *     })
     */
    endpointsParamsGetWithInlinePath(request: SeedApi.EndpointsParamsGetWithInlinePathRequest, requestOptions?: EndpointsParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __endpointsParamsGetWithInlinePath;
    /**
     * PUT to update with path param
     *
     * @param {SeedApi.EndpointsParamsModifyWithInlinePathRequest} request
     * @param {EndpointsParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsParams.endpointsParamsModifyWithInlinePath({
     *         param: "param",
     *         body: "string"
     *     })
     */
    endpointsParamsModifyWithInlinePath(request: SeedApi.EndpointsParamsModifyWithInlinePathRequest, requestOptions?: EndpointsParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __endpointsParamsModifyWithInlinePath;
    /**
     * GET with query param
     *
     * @param {SeedApi.EndpointsParamsGetWithQueryRequest} request
     * @param {EndpointsParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsParams.endpointsParamsGetWithQuery({
     *         query: "query",
     *         number: 1
     *     })
     */
    endpointsParamsGetWithQuery(request: SeedApi.EndpointsParamsGetWithQueryRequest, requestOptions?: EndpointsParamsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __endpointsParamsGetWithQuery;
    /**
     * GET with multiple of same query param
     *
     * @param {SeedApi.EndpointsParamsGetWithAllowMultipleQueryRequest} request
     * @param {EndpointsParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsParams.endpointsParamsGetWithAllowMultipleQuery({
     *         query: "query",
     *         number: 1
     *     })
     */
    endpointsParamsGetWithAllowMultipleQuery(request?: SeedApi.EndpointsParamsGetWithAllowMultipleQueryRequest, requestOptions?: EndpointsParamsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __endpointsParamsGetWithAllowMultipleQuery;
    /**
     * GET with path and query params
     *
     * @param {SeedApi.EndpointsParamsGetWithPathAndQueryRequest} request
     * @param {EndpointsParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsParams.endpointsParamsGetWithPathAndQuery({
     *         param: "param",
     *         query: "query"
     *     })
     */
    endpointsParamsGetWithPathAndQuery(request: SeedApi.EndpointsParamsGetWithPathAndQueryRequest, requestOptions?: EndpointsParamsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __endpointsParamsGetWithPathAndQuery;
    /**
     * GET with path and query params
     *
     * @param {SeedApi.EndpointsParamsGetWithInlinePathAndQueryRequest} request
     * @param {EndpointsParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsParams.endpointsParamsGetWithInlinePathAndQuery({
     *         param: "param",
     *         query: "query"
     *     })
     */
    endpointsParamsGetWithInlinePathAndQuery(request: SeedApi.EndpointsParamsGetWithInlinePathAndQueryRequest, requestOptions?: EndpointsParamsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __endpointsParamsGetWithInlinePathAndQuery;
    /**
     * GET with boolean path param
     *
     * @param {SeedApi.EndpointsParamsGetWithBooleanPathRequest} request
     * @param {EndpointsParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsParams.endpointsParamsGetWithBooleanPath({
     *         param: true
     *     })
     */
    endpointsParamsGetWithBooleanPath(request: SeedApi.EndpointsParamsGetWithBooleanPathRequest, requestOptions?: EndpointsParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __endpointsParamsGetWithBooleanPath;
    /**
     * GET with path param that can throw errors
     *
     * @param {SeedApi.EndpointsParamsGetWithPathAndErrorsRequest} request
     * @param {EndpointsParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.BadRequestError}
     *
     * @example
     *     await client.endpointsParams.endpointsParamsGetWithPathAndErrors({
     *         param: "param"
     *     })
     */
    endpointsParamsGetWithPathAndErrors(request: SeedApi.EndpointsParamsGetWithPathAndErrorsRequest, requestOptions?: EndpointsParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __endpointsParamsGetWithPathAndErrors;
}
