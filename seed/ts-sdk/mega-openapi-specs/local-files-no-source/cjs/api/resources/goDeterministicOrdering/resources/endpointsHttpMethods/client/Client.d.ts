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
     * @param {SeedApi.goDeterministicOrdering.EndpointsHttpMethodsTestGetEndpointsHttpMethodsRequest} request
     * @param {EndpointsHttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpointsHttpMethods.endpointsHttpMethodsTestGet({
     *         id: "id"
     *     })
     */
    endpointsHttpMethodsTestGet(request: SeedApi.goDeterministicOrdering.EndpointsHttpMethodsTestGetEndpointsHttpMethodsRequest, requestOptions?: EndpointsHttpMethodsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __endpointsHttpMethodsTestGet;
    /**
     * @deprecated
     *
     * @param {SeedApi.goDeterministicOrdering.EndpointsHttpMethodsTestPutEndpointsHttpMethodsRequest} request
     * @param {EndpointsHttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpointsHttpMethods.endpointsHttpMethodsTestPut({
     *         id: "id",
     *         body: {
     *             string: "uploaded"
     *         }
     *     })
     */
    endpointsHttpMethodsTestPut(request: SeedApi.goDeterministicOrdering.EndpointsHttpMethodsTestPutEndpointsHttpMethodsRequest, requestOptions?: EndpointsHttpMethodsClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.TypesObjectWithOptionalField>;
    private __endpointsHttpMethodsTestPut;
    /**
     * @param {SeedApi.goDeterministicOrdering.EndpointsHttpMethodsTestDeleteEndpointsHttpMethodsRequest} request
     * @param {EndpointsHttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpointsHttpMethods.endpointsHttpMethodsTestDelete({
     *         id: "id"
     *     })
     */
    endpointsHttpMethodsTestDelete(request: SeedApi.goDeterministicOrdering.EndpointsHttpMethodsTestDeleteEndpointsHttpMethodsRequest, requestOptions?: EndpointsHttpMethodsClient.RequestOptions): core.HttpResponsePromise<boolean>;
    private __endpointsHttpMethodsTestDelete;
    /**
     * @beta This endpoint is in pre-release and may change.
     *
     * @param {SeedApi.goDeterministicOrdering.EndpointsHttpMethodsTestPatchEndpointsHttpMethodsRequest} request
     * @param {EndpointsHttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpointsHttpMethods.endpointsHttpMethodsTestPatch({
     *         id: "id",
     *         body: {}
     *     })
     */
    endpointsHttpMethodsTestPatch(request: SeedApi.goDeterministicOrdering.EndpointsHttpMethodsTestPatchEndpointsHttpMethodsRequest, requestOptions?: EndpointsHttpMethodsClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.TypesObjectWithOptionalField>;
    private __endpointsHttpMethodsTestPatch;
    /**
     * @deprecated
     *
     * @param {SeedApi.goDeterministicOrdering.TypesObjectWithRequiredField} request
     * @param {EndpointsHttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpointsHttpMethods.endpointsHttpMethodsTestPost({
     *         string: "uploaded"
     *     })
     */
    endpointsHttpMethodsTestPost(request: SeedApi.goDeterministicOrdering.TypesObjectWithRequiredField, requestOptions?: EndpointsHttpMethodsClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.TypesObjectWithOptionalField>;
    private __endpointsHttpMethodsTestPost;
}
