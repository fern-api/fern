import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../../../BaseClient.mjs";
import * as core from "../../../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../../../index.mjs";
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
     *     await client.exhaustive.endpoints.container.getAndReturnListOfPrimitives(["string"])
     */
    getAndReturnListOfPrimitives(request: string[], requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<string[]>;
    private __getAndReturnListOfPrimitives;
    /**
     * @param {SeedApi.exhaustive.TypesObjectWithRequiredField[]} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.container.getAndReturnListOfObjects([{
     *             string: "uploaded"
     *         }])
     */
    getAndReturnListOfObjects(request: SeedApi.exhaustive.TypesObjectWithRequiredField[], requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<SeedApi.exhaustive.TypesObjectWithRequiredField[]>;
    private __getAndReturnListOfObjects;
    /**
     * @param {string[]} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.container.getAndReturnSetOfPrimitives(["string"])
     */
    getAndReturnSetOfPrimitives(request: string[], requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<string[]>;
    private __getAndReturnSetOfPrimitives;
    /**
     * @param {SeedApi.exhaustive.TypesObjectWithRequiredField[]} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.container.getAndReturnSetOfObjects([{
     *             string: "uploaded"
     *         }])
     */
    getAndReturnSetOfObjects(request: SeedApi.exhaustive.TypesObjectWithRequiredField[], requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<SeedApi.exhaustive.TypesObjectWithRequiredField[]>;
    private __getAndReturnSetOfObjects;
    /**
     * @param {Record<string, string>} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.container.getAndReturnMapPrimToPrim({
     *         "key": "value"
     *     })
     */
    getAndReturnMapPrimToPrim(request: Record<string, string>, requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<Record<string, string>>;
    private __getAndReturnMapPrimToPrim;
    /**
     * @param {Record<string, SeedApi.exhaustive.TypesObjectWithRequiredField>} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.container.getAndReturnMapOfPrimToObject({
     *         "key": {
     *             string: "uploaded"
     *         }
     *     })
     */
    getAndReturnMapOfPrimToObject(request: Record<string, SeedApi.exhaustive.TypesObjectWithRequiredField>, requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<Record<string, SeedApi.exhaustive.TypesObjectWithRequiredField>>;
    private __getAndReturnMapOfPrimToObject;
    /**
     * @param {Record<string, SeedApi.exhaustive.TypesMixedType>} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.container.getAndReturnMapOfPrimToUndiscriminatedUnion({
     *         "key": 1.1
     *     })
     */
    getAndReturnMapOfPrimToUndiscriminatedUnion(request: Record<string, SeedApi.exhaustive.TypesMixedType>, requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<Record<string, SeedApi.exhaustive.TypesMixedType>>;
    private __getAndReturnMapOfPrimToUndiscriminatedUnion;
    /**
     * @param {SeedApi.exhaustive.TypesObjectWithRequiredField | null} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.container.getAndReturnOptional({
     *         string: "uploaded"
     *     })
     */
    getAndReturnOptional(request: SeedApi.exhaustive.TypesObjectWithRequiredField | null, requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<SeedApi.exhaustive.TypesObjectWithRequiredField | null>;
    private __getAndReturnOptional;
}
