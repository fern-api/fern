import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedExhaustive from "../../../../../index.mjs";
export declare namespace ContainerClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ContainerClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<ContainerClient.Options>;
    protected readonly _requestFn: core.RequestFn;
    constructor(options: ContainerClient.Options);
    constructor(options: ContainerClient.Options, requestFn: core.RequestFn);
    /**
     * @param {string[]} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnListOfPrimitives(["string", "string"])
     */
    getAndReturnListOfPrimitives(request: string[], requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<string[]>;
    /**
     * @param {SeedExhaustive.types.ObjectWithRequiredField[]} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnListOfObjects([{
     *             string: "string"
     *         }, {
     *             string: "string"
     *         }])
     */
    getAndReturnListOfObjects(request: SeedExhaustive.types.ObjectWithRequiredField[], requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.ObjectWithRequiredField[]>;
    /**
     * @param {string[]} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnSetOfPrimitives(["string"])
     */
    getAndReturnSetOfPrimitives(request: string[], requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<string[]>;
    /**
     * @param {SeedExhaustive.types.ObjectWithRequiredField[]} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnSetOfObjects([{
     *             string: "string"
     *         }])
     */
    getAndReturnSetOfObjects(request: SeedExhaustive.types.ObjectWithRequiredField[], requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.ObjectWithRequiredField[]>;
    /**
     * @param {Record<string, string>} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnMapPrimToPrim({
     *         "string": "string"
     *     })
     */
    getAndReturnMapPrimToPrim(request: Record<string, string>, requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<Record<string, string>>;
    /**
     * @param {Record<string, SeedExhaustive.types.ObjectWithRequiredField>} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnMapOfPrimToObject({
     *         "string": {
     *             string: "string"
     *         }
     *     })
     */
    getAndReturnMapOfPrimToObject(request: Record<string, SeedExhaustive.types.ObjectWithRequiredField>, requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<Record<string, SeedExhaustive.types.ObjectWithRequiredField>>;
    /**
     * @param {Record<string, SeedExhaustive.types.MixedType>} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnMapOfPrimToUndiscriminatedUnion({
     *         "string": 1.1
     *     })
     */
    getAndReturnMapOfPrimToUndiscriminatedUnion(request: Record<string, SeedExhaustive.types.MixedType>, requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<Record<string, SeedExhaustive.types.MixedType>>;
    /**
     * @param {SeedExhaustive.types.ObjectWithRequiredField} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnOptional({
     *         string: "string"
     *     })
     */
    getAndReturnOptional(request?: SeedExhaustive.types.ObjectWithRequiredField, requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.ObjectWithRequiredField | undefined>;
}
