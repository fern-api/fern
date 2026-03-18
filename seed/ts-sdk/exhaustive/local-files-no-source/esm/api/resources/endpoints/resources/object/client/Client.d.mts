import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedExhaustive from "../../../../../index.mjs";
export declare namespace ObjectClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ObjectClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<ObjectClient.Options>;
    constructor(options: ObjectClient.Options);
    /**
     * @param {SeedExhaustive.types.ObjectWithOptionalField} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnWithOptionalField({
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
    getAndReturnWithOptionalField(request: SeedExhaustive.types.ObjectWithOptionalField, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.ObjectWithOptionalField>;
    private __getAndReturnWithOptionalField;
    /**
     * Build a standard Fetch `Request` object for the getAndReturnWithOptionalField endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnWithOptionalField(request: SeedExhaustive.types.ObjectWithOptionalField, requestOptions?: ObjectClient.RequestOptions): Promise<Request>;
    /**
     * @param {SeedExhaustive.types.ObjectWithRequiredField} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnWithRequiredField({
     *         string: "string"
     *     })
     */
    getAndReturnWithRequiredField(request: SeedExhaustive.types.ObjectWithRequiredField, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.ObjectWithRequiredField>;
    private __getAndReturnWithRequiredField;
    /**
     * Build a standard Fetch `Request` object for the getAndReturnWithRequiredField endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnWithRequiredField(request: SeedExhaustive.types.ObjectWithRequiredField, requestOptions?: ObjectClient.RequestOptions): Promise<Request>;
    /**
     * @param {SeedExhaustive.types.ObjectWithMapOfMap} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnWithMapOfMap({
     *         map: {
     *             "map": {
     *                 "map": "map"
     *             }
     *         }
     *     })
     */
    getAndReturnWithMapOfMap(request: SeedExhaustive.types.ObjectWithMapOfMap, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.ObjectWithMapOfMap>;
    private __getAndReturnWithMapOfMap;
    /**
     * Build a standard Fetch `Request` object for the getAndReturnWithMapOfMap endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnWithMapOfMap(request: SeedExhaustive.types.ObjectWithMapOfMap, requestOptions?: ObjectClient.RequestOptions): Promise<Request>;
    /**
     * @param {SeedExhaustive.types.NestedObjectWithOptionalField} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnNestedWithOptionalField({
     *         string: "string",
     *         NestedObject: {
     *             string: "string",
     *             integer: 1,
     *             long: 1000000,
     *             double: 1.1,
     *             bool: true,
     *             datetime: "2024-01-15T09:30:00Z",
     *             date: "2023-01-15",
     *             uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
     *             base64: "SGVsbG8gd29ybGQh",
     *             list: ["list", "list"],
     *             set: ["set"],
     *             map: {
     *                 1: "map"
     *             },
     *             bigint: "1000000"
     *         }
     *     })
     */
    getAndReturnNestedWithOptionalField(request: SeedExhaustive.types.NestedObjectWithOptionalField, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.NestedObjectWithOptionalField>;
    private __getAndReturnNestedWithOptionalField;
    /**
     * Build a standard Fetch `Request` object for the getAndReturnNestedWithOptionalField endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnNestedWithOptionalField(request: SeedExhaustive.types.NestedObjectWithOptionalField, requestOptions?: ObjectClient.RequestOptions): Promise<Request>;
    /**
     * @param {string} string
     * @param {SeedExhaustive.types.NestedObjectWithRequiredField} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnNestedWithRequiredField("string", {
     *         string: "string",
     *         NestedObject: {
     *             string: "string",
     *             integer: 1,
     *             long: 1000000,
     *             double: 1.1,
     *             bool: true,
     *             datetime: "2024-01-15T09:30:00Z",
     *             date: "2023-01-15",
     *             uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
     *             base64: "SGVsbG8gd29ybGQh",
     *             list: ["list", "list"],
     *             set: ["set"],
     *             map: {
     *                 1: "map"
     *             },
     *             bigint: "1000000"
     *         }
     *     })
     */
    getAndReturnNestedWithRequiredField(string: string, request: SeedExhaustive.types.NestedObjectWithRequiredField, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.NestedObjectWithRequiredField>;
    private __getAndReturnNestedWithRequiredField;
    /**
     * Build a standard Fetch `Request` object for the getAndReturnNestedWithRequiredField endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnNestedWithRequiredField(string: string, request: SeedExhaustive.types.NestedObjectWithRequiredField, requestOptions?: ObjectClient.RequestOptions): Promise<Request>;
    /**
     * @param {SeedExhaustive.types.NestedObjectWithRequiredField[]} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnNestedWithRequiredFieldAsList([{
     *             string: "string",
     *             NestedObject: {
     *                 string: "string",
     *                 integer: 1,
     *                 long: 1000000,
     *                 double: 1.1,
     *                 bool: true,
     *                 datetime: "2024-01-15T09:30:00Z",
     *                 date: "2023-01-15",
     *                 uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
     *                 base64: "SGVsbG8gd29ybGQh",
     *                 list: ["list", "list"],
     *                 set: ["set"],
     *                 map: {
     *                     1: "map"
     *                 },
     *                 bigint: "1000000"
     *             }
     *         }, {
     *             string: "string",
     *             NestedObject: {
     *                 string: "string",
     *                 integer: 1,
     *                 long: 1000000,
     *                 double: 1.1,
     *                 bool: true,
     *                 datetime: "2024-01-15T09:30:00Z",
     *                 date: "2023-01-15",
     *                 uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
     *                 base64: "SGVsbG8gd29ybGQh",
     *                 list: ["list", "list"],
     *                 set: ["set"],
     *                 map: {
     *                     1: "map"
     *                 },
     *                 bigint: "1000000"
     *             }
     *         }])
     */
    getAndReturnNestedWithRequiredFieldAsList(request: SeedExhaustive.types.NestedObjectWithRequiredField[], requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.NestedObjectWithRequiredField>;
    private __getAndReturnNestedWithRequiredFieldAsList;
    /**
     * Build a standard Fetch `Request` object for the getAndReturnNestedWithRequiredFieldAsList endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnNestedWithRequiredFieldAsList(request: SeedExhaustive.types.NestedObjectWithRequiredField[], requestOptions?: ObjectClient.RequestOptions): Promise<Request>;
    /**
     * @param {SeedExhaustive.types.ObjectWithUnknownField} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnWithUnknownField({
     *         unknown: {
     *             "$ref": "https://example.com/schema"
     *         }
     *     })
     */
    getAndReturnWithUnknownField(request: SeedExhaustive.types.ObjectWithUnknownField, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.ObjectWithUnknownField>;
    private __getAndReturnWithUnknownField;
    /**
     * Build a standard Fetch `Request` object for the getAndReturnWithUnknownField endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnWithUnknownField(request: SeedExhaustive.types.ObjectWithUnknownField, requestOptions?: ObjectClient.RequestOptions): Promise<Request>;
    /**
     * @param {SeedExhaustive.types.ObjectWithDocumentedUnknownType} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnWithDocumentedUnknownType({
     *         documentedUnknownType: {
     *             "key": "value"
     *         }
     *     })
     */
    getAndReturnWithDocumentedUnknownType(request: SeedExhaustive.types.ObjectWithDocumentedUnknownType, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.ObjectWithDocumentedUnknownType>;
    private __getAndReturnWithDocumentedUnknownType;
    /**
     * Build a standard Fetch `Request` object for the getAndReturnWithDocumentedUnknownType endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnWithDocumentedUnknownType(request: SeedExhaustive.types.ObjectWithDocumentedUnknownType, requestOptions?: ObjectClient.RequestOptions): Promise<Request>;
    /**
     * @param {SeedExhaustive.types.MapOfDocumentedUnknownType} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnMapOfDocumentedUnknownType({
     *         "string": {
     *             "key": "value"
     *         }
     *     })
     */
    getAndReturnMapOfDocumentedUnknownType(request: SeedExhaustive.types.MapOfDocumentedUnknownType, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.MapOfDocumentedUnknownType>;
    private __getAndReturnMapOfDocumentedUnknownType;
    /**
     * Build a standard Fetch `Request` object for the getAndReturnMapOfDocumentedUnknownType endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnMapOfDocumentedUnknownType(request: SeedExhaustive.types.MapOfDocumentedUnknownType, requestOptions?: ObjectClient.RequestOptions): Promise<Request>;
    /**
     * Tests that string fields containing datetime-like values are NOT reformatted.
     * The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
     * without being converted to "2023-08-31T14:15:22.000Z".
     *
     * @param {SeedExhaustive.types.ObjectWithDatetimeLikeString} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnWithDatetimeLikeString({
     *         datetimeLikeString: "2023-08-31T14:15:22Z",
     *         actualDatetime: "2023-08-31T14:15:22Z"
     *     })
     */
    getAndReturnWithDatetimeLikeString(request: SeedExhaustive.types.ObjectWithDatetimeLikeString, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.ObjectWithDatetimeLikeString>;
    private __getAndReturnWithDatetimeLikeString;
    /**
     * Build a standard Fetch `Request` object for the getAndReturnWithDatetimeLikeString endpoint. The returned request has auth, headers, query parameters, and body fully resolved — the caller is responsible for sending it.
     */
    buildRequestForGetAndReturnWithDatetimeLikeString(request: SeedExhaustive.types.ObjectWithDatetimeLikeString, requestOptions?: ObjectClient.RequestOptions): Promise<Request>;
}
