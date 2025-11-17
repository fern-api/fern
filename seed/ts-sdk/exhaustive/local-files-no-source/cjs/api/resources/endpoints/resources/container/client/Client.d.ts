import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedExhaustive from "../../../../../index.js";
export declare namespace ContainerClient {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ContainerClient {
    protected readonly _options: ContainerClient.Options;
    constructor(options: ContainerClient.Options);
    /**
     * @param {string[]} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnListOfPrimitives(["string", "string"])
     */
    getAndReturnListOfPrimitives(request: string[], requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<string[]>;
    private __getAndReturnListOfPrimitives;
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
     * @param {SeedExhaustive.types.ObjectWithRequiredField[]} request
     * @param {ContainerClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.container.getAndReturnSetOfObjects([{
     *             string: "string"
     *         }])
     */
    getAndReturnSetOfObjects(request: SeedExhaustive.types.ObjectWithRequiredField[], requestOptions?: ContainerClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.ObjectWithRequiredField[]>;
    private __getAndReturnSetOfObjects;
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
    private __getAndReturnMapPrimToPrim;
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
    private __getAndReturnMapOfPrimToObject;
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
    private __getAndReturnOptional;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
