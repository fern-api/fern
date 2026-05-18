import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace EndpointsHttpMethodsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class EndpointsHttpMethodsClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<EndpointsHttpMethodsClient.Options>;
    constructor(options: EndpointsHttpMethodsClient.Options);
    /**
     * @param {SeedApi.exhaustive.EndpointsHttpMethodsTestGetEndpointsHttpMethodsRequest} request
     * @param {EndpointsHttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpointsHttpMethods.endpointsHttpMethodsTestGet({
     *         id: "id"
     *     })
     */
    endpointsHttpMethodsTestGet(request: SeedApi.exhaustive.EndpointsHttpMethodsTestGetEndpointsHttpMethodsRequest, requestOptions?: EndpointsHttpMethodsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __endpointsHttpMethodsTestGet;
    /**
     * @deprecated
     *
     * @param {SeedApi.exhaustive.EndpointsHttpMethodsTestPutEndpointsHttpMethodsRequest} request
     * @param {EndpointsHttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpointsHttpMethods.endpointsHttpMethodsTestPut({
     *         id: "id",
     *         body: {
     *             string: "uploaded"
     *         }
     *     })
     */
    endpointsHttpMethodsTestPut(request: SeedApi.exhaustive.EndpointsHttpMethodsTestPutEndpointsHttpMethodsRequest, requestOptions?: EndpointsHttpMethodsClient.RequestOptions): core.HttpResponsePromise<SeedApi.exhaustive.TypesObjectWithOptionalField>;
    private __endpointsHttpMethodsTestPut;
    /**
     * @param {SeedApi.exhaustive.EndpointsHttpMethodsTestDeleteEndpointsHttpMethodsRequest} request
     * @param {EndpointsHttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpointsHttpMethods.endpointsHttpMethodsTestDelete({
     *         id: "id"
     *     })
     */
    endpointsHttpMethodsTestDelete(request: SeedApi.exhaustive.EndpointsHttpMethodsTestDeleteEndpointsHttpMethodsRequest, requestOptions?: EndpointsHttpMethodsClient.RequestOptions): core.HttpResponsePromise<boolean>;
    private __endpointsHttpMethodsTestDelete;
    /**
     * @beta This endpoint is in pre-release and may change.
     *
     * @param {SeedApi.exhaustive.EndpointsHttpMethodsTestPatchEndpointsHttpMethodsRequest} request
     * @param {EndpointsHttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpointsHttpMethods.endpointsHttpMethodsTestPatch({
     *         id: "id",
     *         body: {}
     *     })
     */
    endpointsHttpMethodsTestPatch(request: SeedApi.exhaustive.EndpointsHttpMethodsTestPatchEndpointsHttpMethodsRequest, requestOptions?: EndpointsHttpMethodsClient.RequestOptions): core.HttpResponsePromise<SeedApi.exhaustive.TypesObjectWithOptionalField>;
    private __endpointsHttpMethodsTestPatch;
    /**
     * @deprecated
     *
     * @param {SeedApi.exhaustive.TypesObjectWithRequiredField} request
     * @param {EndpointsHttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpointsHttpMethods.endpointsHttpMethodsTestPost({
     *         string: "uploaded"
     *     })
     */
    endpointsHttpMethodsTestPost(request: SeedApi.exhaustive.TypesObjectWithRequiredField, requestOptions?: EndpointsHttpMethodsClient.RequestOptions): core.HttpResponsePromise<SeedApi.exhaustive.TypesObjectWithOptionalField>;
    private __endpointsHttpMethodsTestPost;
}
