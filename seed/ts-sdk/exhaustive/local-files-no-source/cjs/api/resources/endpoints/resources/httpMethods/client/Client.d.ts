import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace HttpMethodsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class HttpMethodsClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<HttpMethodsClient.Options>;
    constructor(options: HttpMethodsClient.Options);
    /**
     * @param {SeedApi.endpoints.TestGetHttpMethodsRequest} request
     * @param {HttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.httpMethods.testGet({
     *         id: "id"
     *     })
     */
    testGet(request: SeedApi.endpoints.TestGetHttpMethodsRequest, requestOptions?: HttpMethodsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __testGet;
    /**
     * @param {SeedApi.endpoints.TestPutHttpMethodsRequest} request
     * @param {HttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.httpMethods.testPut({
     *         id: "id",
     *         body: {
     *             string: "string"
     *         }
     *     })
     */
    testPut(request: SeedApi.endpoints.TestPutHttpMethodsRequest, requestOptions?: HttpMethodsClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithOptionalField>;
    private __testPut;
    /**
     * @param {SeedApi.endpoints.TestDeleteHttpMethodsRequest} request
     * @param {HttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.httpMethods.testDelete({
     *         id: "id"
     *     })
     */
    testDelete(request: SeedApi.endpoints.TestDeleteHttpMethodsRequest, requestOptions?: HttpMethodsClient.RequestOptions): core.HttpResponsePromise<boolean>;
    private __testDelete;
    /**
     * @param {SeedApi.endpoints.TestPatchHttpMethodsRequest} request
     * @param {HttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.httpMethods.testPatch({
     *         id: "id",
     *         body: {}
     *     })
     */
    testPatch(request: SeedApi.endpoints.TestPatchHttpMethodsRequest, requestOptions?: HttpMethodsClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithOptionalField>;
    private __testPatch;
    /**
     * @param {SeedApi.TypesObjectWithRequiredField} request
     * @param {HttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.httpMethods.testPost({
     *         string: "string"
     *     })
     */
    testPost(request: SeedApi.TypesObjectWithRequiredField, requestOptions?: HttpMethodsClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithOptionalField>;
    private __testPost;
}
