import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedExhaustive from "../../../../../index.mjs";
export declare namespace HttpMethodsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class HttpMethodsClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<HttpMethodsClient.Options>;
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
     * Build a standard Fetch `Request` object for the testGet endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForTestGet(id: string, requestOptions?: HttpMethodsClient.RequestOptions): Promise<Request>;
    /**
     * @deprecated
     *
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
     * Build a standard Fetch `Request` object for the testPost endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForTestPost(request: SeedExhaustive.types.ObjectWithRequiredField, requestOptions?: HttpMethodsClient.RequestOptions): Promise<Request>;
    /**
     * @deprecated Use testPatch instead.
     *
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
     * Build a standard Fetch `Request` object for the testPut endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForTestPut(id: string, request: SeedExhaustive.types.ObjectWithRequiredField, requestOptions?: HttpMethodsClient.RequestOptions): Promise<Request>;
    /**
     * @beta This endpoint is in pre-release and may change.
     *
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
     * Build a standard Fetch `Request` object for the testPatch endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForTestPatch(id: string, request: SeedExhaustive.types.ObjectWithOptionalField, requestOptions?: HttpMethodsClient.RequestOptions): Promise<Request>;
    /**
     * @beta This endpoint is in development and may change.
     *
     * @param {string} id
     * @param {HttpMethodsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.httpMethods.testDelete("id")
     */
    testDelete(id: string, requestOptions?: HttpMethodsClient.RequestOptions): core.HttpResponsePromise<boolean>;
    private __testDelete;
    /**
     * Build a standard Fetch `Request` object for the testDelete endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForTestDelete(id: string, requestOptions?: HttpMethodsClient.RequestOptions): Promise<Request>;
}
