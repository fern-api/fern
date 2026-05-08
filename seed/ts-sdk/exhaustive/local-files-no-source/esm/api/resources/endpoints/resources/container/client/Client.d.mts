import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace ContainerClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ContainerClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<ContainerClient.Options>;
    constructor(options: ContainerClient.Options);
    /**
     * @param {string[]} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnListOfPrimitives(["string"])
     */
    getAndReturnListOfPrimitives(request: string[], requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<string[]>;
    private __getAndReturnListOfPrimitives;
    /**
     * @param {SeedApi.TypesObjectWithRequiredField[]} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnListOfObjects([{
     *             string: "string"
     *         }])
     */
    getAndReturnListOfObjects(request: SeedApi.TypesObjectWithRequiredField[], requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithRequiredField[]>;
    private __getAndReturnListOfObjects;
    /**
     * @param {string[]} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnSetOfPrimitives(["string"])
     */
    getAndReturnSetOfPrimitives(request: string[], requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<string[]>;
    private __getAndReturnSetOfPrimitives;
    /**
     * @param {SeedApi.TypesObjectWithRequiredField[]} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnSetOfObjects([{
     *             string: "string"
     *         }])
     */
    getAndReturnSetOfObjects(request: SeedApi.TypesObjectWithRequiredField[], requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithRequiredField[]>;
    private __getAndReturnSetOfObjects;
    /**
     * @param {Record<string, string>} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnMapPrimToPrim({
     *         "key": "value"
     *     })
     */
    getAndReturnMapPrimToPrim(request: Record<string, string>, requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<Record<string, string>>;
    private __getAndReturnMapPrimToPrim;
    /**
     * @param {Record<string, SeedApi.TypesObjectWithRequiredField>} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnMapOfPrimToObject({
     *         "key": {
     *             string: "string"
     *         }
     *     })
     */
    getAndReturnMapOfPrimToObject(request: Record<string, SeedApi.TypesObjectWithRequiredField>, requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<Record<string, SeedApi.TypesObjectWithRequiredField>>;
    private __getAndReturnMapOfPrimToObject;
    /**
     * @param {Record<string, SeedApi.TypesMixedType>} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnMapOfPrimToUndiscriminatedUnion({
     *         "key": 1.1
     *     })
     */
    getAndReturnMapOfPrimToUndiscriminatedUnion(request: Record<string, SeedApi.TypesMixedType>, requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<Record<string, SeedApi.TypesMixedType>>;
    private __getAndReturnMapOfPrimToUndiscriminatedUnion;
    /**
     * @param {SeedApi.TypesObjectWithRequiredField} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnOptional({
     *         string: "string"
     *     })
     */
    getAndReturnOptional(request: SeedApi.TypesObjectWithRequiredField, requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithRequiredField>;
    private __getAndReturnOptional;
}
