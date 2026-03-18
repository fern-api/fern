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
     * Build a standard Fetch `Request` object for the getAndReturnListOfPrimitives endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnListOfPrimitives(request: string[], requestOptions?: ContainerClient.RequestOptions): Promise<Request>;
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
     * Build a standard Fetch `Request` object for the getAndReturnListOfObjects endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnListOfObjects(request: SeedExhaustive.types.ObjectWithRequiredField[], requestOptions?: ContainerClient.RequestOptions): Promise<Request>;
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
     * Build a standard Fetch `Request` object for the getAndReturnSetOfPrimitives endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnSetOfPrimitives(request: string[], requestOptions?: ContainerClient.RequestOptions): Promise<Request>;
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
     * Build a standard Fetch `Request` object for the getAndReturnSetOfObjects endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnSetOfObjects(request: SeedExhaustive.types.ObjectWithRequiredField[], requestOptions?: ContainerClient.RequestOptions): Promise<Request>;
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
     * Build a standard Fetch `Request` object for the getAndReturnMapPrimToPrim endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnMapPrimToPrim(request: Record<string, string>, requestOptions?: ContainerClient.RequestOptions): Promise<Request>;
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
     * Build a standard Fetch `Request` object for the getAndReturnMapOfPrimToObject endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnMapOfPrimToObject(request: Record<string, SeedExhaustive.types.ObjectWithRequiredField>, requestOptions?: ContainerClient.RequestOptions): Promise<Request>;
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
    private __getAndReturnMapOfPrimToUndiscriminatedUnion;
    /**
     * Build a standard Fetch `Request` object for the getAndReturnMapOfPrimToUndiscriminatedUnion endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnMapOfPrimToUndiscriminatedUnion(request: Record<string, SeedExhaustive.types.MixedType>, requestOptions?: ContainerClient.RequestOptions): Promise<Request>;
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
    /**
     * Build a standard Fetch `Request` object for the getAndReturnOptional endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnOptional(request?: SeedExhaustive.types.ObjectWithRequiredField, requestOptions?: ContainerClient.RequestOptions): Promise<Request>;
}
