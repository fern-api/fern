import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import * as core from "../../../../core/index.mjs";
import type * as SeedApi from "../../../index.mjs";
export declare namespace EndpointsHttpMethodsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class EndpointsHttpMethodsClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<EndpointsHttpMethodsClient.Options>;
    constructor(options: EndpointsHttpMethodsClient.Options);
    /**
     * @param {SeedApi.EndpointsHttpMethodsTestGetRequest} request
     * @param {EndpointsHttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsHttpMethods.endpointsHttpMethodsTestGet({
     *         id: "id"
     *     })
     */
    endpointsHttpMethodsTestGet(request: SeedApi.EndpointsHttpMethodsTestGetRequest, requestOptions?: EndpointsHttpMethodsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __endpointsHttpMethodsTestGet;
    /**
     * @param {SeedApi.EndpointsHttpMethodsTestPutRequest} request
     * @param {EndpointsHttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsHttpMethods.endpointsHttpMethodsTestPut({
     *         id: "id",
     *         body: {
     *             string: "string"
     *         }
     *     })
     */
    endpointsHttpMethodsTestPut(request: SeedApi.EndpointsHttpMethodsTestPutRequest, requestOptions?: EndpointsHttpMethodsClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithOptionalField>;
    private __endpointsHttpMethodsTestPut;
    /**
     * @param {SeedApi.EndpointsHttpMethodsTestDeleteRequest} request
     * @param {EndpointsHttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsHttpMethods.endpointsHttpMethodsTestDelete({
     *         id: "id"
     *     })
     */
    endpointsHttpMethodsTestDelete(request: SeedApi.EndpointsHttpMethodsTestDeleteRequest, requestOptions?: EndpointsHttpMethodsClient.RequestOptions): core.HttpResponsePromise<boolean>;
    private __endpointsHttpMethodsTestDelete;
    /**
     * @param {SeedApi.EndpointsHttpMethodsTestPatchRequest} request
     * @param {EndpointsHttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsHttpMethods.endpointsHttpMethodsTestPatch({
     *         id: "id",
     *         body: {}
     *     })
     */
    endpointsHttpMethodsTestPatch(request: SeedApi.EndpointsHttpMethodsTestPatchRequest, requestOptions?: EndpointsHttpMethodsClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithOptionalField>;
    private __endpointsHttpMethodsTestPatch;
    /**
     * @param {SeedApi.TypesObjectWithRequiredField} request
     * @param {EndpointsHttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsHttpMethods.endpointsHttpMethodsTestPost({
     *         string: "string"
     *     })
     */
    endpointsHttpMethodsTestPost(request: SeedApi.TypesObjectWithRequiredField, requestOptions?: EndpointsHttpMethodsClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithOptionalField>;
    private __endpointsHttpMethodsTestPost;
}
