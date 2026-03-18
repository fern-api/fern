import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedExhaustive from "../../../../../index.mjs";
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
     * @param {string} param
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.params.getWithPath("param")
     */
    getWithPath(param: string, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getWithPath;
    /**
     * Build a standard Fetch `Request` object for the getWithPath endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetWithPath(param: string, requestOptions?: ParamsClient.RequestOptions): Promise<Request>;
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
     * Build a standard Fetch `Request` object for the getWithInlinePath endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetWithInlinePath(request: SeedExhaustive.endpoints.GetWithInlinePath, requestOptions?: ParamsClient.RequestOptions): Promise<Request>;
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
     * Build a standard Fetch `Request` object for the getWithQuery endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetWithQuery(request: SeedExhaustive.endpoints.GetWithQuery, requestOptions?: ParamsClient.RequestOptions): Promise<Request>;
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
     * Build a standard Fetch `Request` object for the getWithAllowMultipleQuery endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetWithAllowMultipleQuery(request: SeedExhaustive.endpoints.GetWithMultipleQuery, requestOptions?: ParamsClient.RequestOptions): Promise<Request>;
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
     * Build a standard Fetch `Request` object for the getWithPathAndQuery endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetWithPathAndQuery(param: string, request: SeedExhaustive.endpoints.GetWithPathAndQuery, requestOptions?: ParamsClient.RequestOptions): Promise<Request>;
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
     * Build a standard Fetch `Request` object for the getWithInlinePathAndQuery endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetWithInlinePathAndQuery(request: SeedExhaustive.endpoints.GetWithInlinePathAndQuery, requestOptions?: ParamsClient.RequestOptions): Promise<Request>;
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
     * Build a standard Fetch `Request` object for the modifyWithPath endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForModifyWithPath(param: string, request: string, requestOptions?: ParamsClient.RequestOptions): Promise<Request>;
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
    /**
     * Build a standard Fetch `Request` object for the modifyWithInlinePath endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForModifyWithInlinePath(request: SeedExhaustive.endpoints.ModifyResourceAtInlinedPath, requestOptions?: ParamsClient.RequestOptions): Promise<Request>;
    /**
     * POST bytes with path param returning object
     *
     * @param {core.file.Uploadable} uploadable
     * @param {string} param
     * @param {ParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     import { createReadStream } from "fs";
     *     await client.endpoints.params.uploadWithPath(createReadStream("path/to/file"), "upload-path")
     */
    uploadWithPath(uploadable: core.file.Uploadable, param: string, requestOptions?: ParamsClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.ObjectWithRequiredField>;
    private __uploadWithPath;
    /**
     * Build a standard Fetch `Request` object for the uploadWithPath endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForUploadWithPath(uploadable: core.file.Uploadable, param: string, requestOptions?: ParamsClient.RequestOptions): Promise<Request>;
}
