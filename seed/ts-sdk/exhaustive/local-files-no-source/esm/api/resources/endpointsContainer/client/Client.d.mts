import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import * as core from "../../../../core/index.mjs";
import type * as SeedApi from "../../../index.mjs";
export declare namespace EndpointsContainerClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class EndpointsContainerClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<EndpointsContainerClient.Options>;
    constructor(options: EndpointsContainerClient.Options);
    /**
     * @param {string[]} request
     * @param {EndpointsContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsContainer.endpointsContainerGetAndReturnListOfPrimitives(["string"])
     */
    endpointsContainerGetAndReturnListOfPrimitives(request: string[], requestOptions?: EndpointsContainerClient.RequestOptions): core.HttpResponsePromise<string[]>;
    private __endpointsContainerGetAndReturnListOfPrimitives;
    /**
     * @param {SeedApi.TypesObjectWithRequiredField[]} request
     * @param {EndpointsContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsContainer.endpointsContainerGetAndReturnListOfObjects([{
     *             string: "string"
     *         }])
     */
    endpointsContainerGetAndReturnListOfObjects(request: SeedApi.TypesObjectWithRequiredField[], requestOptions?: EndpointsContainerClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithRequiredField[]>;
    private __endpointsContainerGetAndReturnListOfObjects;
    /**
     * @param {string[]} request
     * @param {EndpointsContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsContainer.endpointsContainerGetAndReturnSetOfPrimitives(["string"])
     */
    endpointsContainerGetAndReturnSetOfPrimitives(request: string[], requestOptions?: EndpointsContainerClient.RequestOptions): core.HttpResponsePromise<string[]>;
    private __endpointsContainerGetAndReturnSetOfPrimitives;
    /**
     * @param {SeedApi.TypesObjectWithRequiredField[]} request
     * @param {EndpointsContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsContainer.endpointsContainerGetAndReturnSetOfObjects([{
     *             string: "string"
     *         }])
     */
    endpointsContainerGetAndReturnSetOfObjects(request: SeedApi.TypesObjectWithRequiredField[], requestOptions?: EndpointsContainerClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithRequiredField[]>;
    private __endpointsContainerGetAndReturnSetOfObjects;
    /**
     * @param {Record<string, string>} request
     * @param {EndpointsContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsContainer.endpointsContainerGetAndReturnMapPrimToPrim({
     *         "key": "value"
     *     })
     */
    endpointsContainerGetAndReturnMapPrimToPrim(request: Record<string, string>, requestOptions?: EndpointsContainerClient.RequestOptions): core.HttpResponsePromise<Record<string, string>>;
    private __endpointsContainerGetAndReturnMapPrimToPrim;
    /**
     * @param {Record<string, SeedApi.TypesObjectWithRequiredField>} request
     * @param {EndpointsContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsContainer.endpointsContainerGetAndReturnMapOfPrimToObject({
     *         "key": {
     *             string: "string"
     *         }
     *     })
     */
    endpointsContainerGetAndReturnMapOfPrimToObject(request: Record<string, SeedApi.TypesObjectWithRequiredField>, requestOptions?: EndpointsContainerClient.RequestOptions): core.HttpResponsePromise<Record<string, SeedApi.TypesObjectWithRequiredField>>;
    private __endpointsContainerGetAndReturnMapOfPrimToObject;
    /**
     * @param {Record<string, SeedApi.TypesMixedType>} request
     * @param {EndpointsContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsContainer.endpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnion({
     *         "key": 1.1
     *     })
     */
    endpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnion(request: Record<string, SeedApi.TypesMixedType>, requestOptions?: EndpointsContainerClient.RequestOptions): core.HttpResponsePromise<Record<string, SeedApi.TypesMixedType>>;
    private __endpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnion;
    /**
     * @param {SeedApi.TypesObjectWithRequiredField} request
     * @param {EndpointsContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsContainer.endpointsContainerGetAndReturnOptional({
     *         string: "string"
     *     })
     */
    endpointsContainerGetAndReturnOptional(request: SeedApi.TypesObjectWithRequiredField, requestOptions?: EndpointsContainerClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithRequiredField>;
    private __endpointsContainerGetAndReturnOptional;
}
