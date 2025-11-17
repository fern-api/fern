import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedExhaustive from "../../../../../index.js";
export declare namespace HttpMethodsClient {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class HttpMethodsClient {
    protected readonly _options: HttpMethodsClient.Options;
    constructor(options: HttpMethodsClient.Options);
    /**
     * @param {string} id
     * @param {HttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.httpMethods.testGet("id")
     */
    testGet(id: string, requestOptions?: HttpMethodsClient.RequestOptions): core.HttpResponsePromise<string>;
    private __testGet;
    /**
     * @param {SeedExhaustive.types.ObjectWithRequiredField} request
     * @param {HttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.httpMethods.testPost({
     *         string: "string"
     *     })
     */
    testPost(request: SeedExhaustive.types.ObjectWithRequiredField, requestOptions?: HttpMethodsClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.ObjectWithOptionalField>;
    private __testPost;
    /**
     * @param {string} id
     * @param {SeedExhaustive.types.ObjectWithRequiredField} request
     * @param {HttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.httpMethods.testPut("id", {
     *         string: "string"
     *     })
     */
    testPut(id: string, request: SeedExhaustive.types.ObjectWithRequiredField, requestOptions?: HttpMethodsClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.ObjectWithOptionalField>;
    private __testPut;
    /**
     * @param {string} id
     * @param {SeedExhaustive.types.ObjectWithOptionalField} request
     * @param {HttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.httpMethods.testPatch("id", {
     *         string: "string",
     *         integer: 1,
     *         long: 1000000,
     *         double: 1.1,
     *         bool: true,
     *         datetime: "2024-01-15T09:30:00Z",
     *         date: "2023-01-15",
     *         uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
     *         base64: "SGVsbG8gd29ybGQh",
     *         list: ["list", "list"],
     *         set: ["set"],
     *         map: {
     *             1: "map"
     *         },
     *         bigint: "1000000"
     *     })
     */
    testPatch(id: string, request: SeedExhaustive.types.ObjectWithOptionalField, requestOptions?: HttpMethodsClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.ObjectWithOptionalField>;
    private __testPatch;
    /**
     * @param {string} id
     * @param {HttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.httpMethods.testDelete("id")
     */
    testDelete(id: string, requestOptions?: HttpMethodsClient.RequestOptions): core.HttpResponsePromise<boolean>;
    private __testDelete;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
