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
     *     await client.goDeterministicOrdering.endpoints.container.getAndReturnListOfPrimitives(["string"])
     */
    getAndReturnListOfPrimitives(request: string[], requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<string[]>;
    private __getAndReturnListOfPrimitives;
    /**
     * @param {SeedApi.goDeterministicOrdering.TypesObjectWithRequiredField[]} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.container.getAndReturnListOfObjects([{
     *             string: "uploaded"
     *         }])
     */
    getAndReturnListOfObjects(request: SeedApi.goDeterministicOrdering.TypesObjectWithRequiredField[], requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.TypesObjectWithRequiredField[]>;
    private __getAndReturnListOfObjects;
    /**
     * @param {string[]} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.container.getAndReturnSetOfPrimitives(["string"])
     */
    getAndReturnSetOfPrimitives(request: string[], requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<string[]>;
    private __getAndReturnSetOfPrimitives;
    /**
     * @param {SeedApi.goDeterministicOrdering.TypesObjectWithRequiredField[]} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.container.getAndReturnSetOfObjects([{
     *             string: "uploaded"
     *         }])
     */
    getAndReturnSetOfObjects(request: SeedApi.goDeterministicOrdering.TypesObjectWithRequiredField[], requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.TypesObjectWithRequiredField[]>;
    private __getAndReturnSetOfObjects;
    /**
     * @param {Record<string, string>} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.container.getAndReturnMapPrimToPrim({
     *         "key": "value"
     *     })
     */
    getAndReturnMapPrimToPrim(request: Record<string, string>, requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<Record<string, string>>;
    private __getAndReturnMapPrimToPrim;
    /**
     * @param {Record<string, SeedApi.goDeterministicOrdering.TypesObjectWithRequiredField>} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.container.getAndReturnMapOfPrimToObject({
     *         "key": {
     *             string: "uploaded"
     *         }
     *     })
     */
    getAndReturnMapOfPrimToObject(request: Record<string, SeedApi.goDeterministicOrdering.TypesObjectWithRequiredField>, requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<Record<string, SeedApi.goDeterministicOrdering.TypesObjectWithRequiredField>>;
    private __getAndReturnMapOfPrimToObject;
    /**
     * @param {Record<string, SeedApi.goDeterministicOrdering.TypesMixedType>} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.container.getAndReturnMapOfPrimToUndiscriminatedUnion({
     *         "key": 1.1
     *     })
     */
    getAndReturnMapOfPrimToUndiscriminatedUnion(request: Record<string, SeedApi.goDeterministicOrdering.TypesMixedType>, requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<Record<string, SeedApi.goDeterministicOrdering.TypesMixedType>>;
    private __getAndReturnMapOfPrimToUndiscriminatedUnion;
    /**
     * @param {SeedApi.goDeterministicOrdering.TypesObjectWithRequiredField | null} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.container.getAndReturnOptional({
     *         string: "uploaded"
     *     })
     */
    getAndReturnOptional(request: SeedApi.goDeterministicOrdering.TypesObjectWithRequiredField | null, requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.TypesObjectWithRequiredField | null>;
    private __getAndReturnOptional;
}
