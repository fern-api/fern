import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import * as SeedExhaustive from "../../../../../index.js";
export declare namespace Object_ {
    interface Options extends BaseClientOptions {
    }
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class Object_ {
    protected readonly _options: Object_.Options;
    constructor(_options: Object_.Options);
    /**
     * @param {SeedExhaustive.types.ObjectWithOptionalField} request
     * @param {Object_.RequestOptions} requestOptions - Request-specific configuration.
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
    getAndReturnWithOptionalField(request: SeedExhaustive.types.ObjectWithOptionalField, requestOptions?: Object_.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.ObjectWithOptionalField>;
    private __getAndReturnWithOptionalField;
    /**
     * @param {SeedExhaustive.types.ObjectWithRequiredField} request
     * @param {Object_.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnWithRequiredField({
     *         string: "string"
     *     })
     */
    getAndReturnWithRequiredField(request: SeedExhaustive.types.ObjectWithRequiredField, requestOptions?: Object_.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.ObjectWithRequiredField>;
    private __getAndReturnWithRequiredField;
    /**
     * @param {SeedExhaustive.types.ObjectWithMapOfMap} request
     * @param {Object_.RequestOptions} requestOptions - Request-specific configuration.
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
    getAndReturnWithMapOfMap(request: SeedExhaustive.types.ObjectWithMapOfMap, requestOptions?: Object_.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.ObjectWithMapOfMap>;
    private __getAndReturnWithMapOfMap;
    /**
     * @param {SeedExhaustive.types.NestedObjectWithOptionalField} request
     * @param {Object_.RequestOptions} requestOptions - Request-specific configuration.
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
    getAndReturnNestedWithOptionalField(request: SeedExhaustive.types.NestedObjectWithOptionalField, requestOptions?: Object_.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.NestedObjectWithOptionalField>;
    private __getAndReturnNestedWithOptionalField;
    /**
     * @param {string} string_
     * @param {SeedExhaustive.types.NestedObjectWithRequiredField} request
     * @param {Object_.RequestOptions} requestOptions - Request-specific configuration.
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
    getAndReturnNestedWithRequiredField(string_: string, request: SeedExhaustive.types.NestedObjectWithRequiredField, requestOptions?: Object_.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.NestedObjectWithRequiredField>;
    private __getAndReturnNestedWithRequiredField;
    /**
     * @param {SeedExhaustive.types.NestedObjectWithRequiredField[]} request
     * @param {Object_.RequestOptions} requestOptions - Request-specific configuration.
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
    getAndReturnNestedWithRequiredFieldAsList(request: SeedExhaustive.types.NestedObjectWithRequiredField[], requestOptions?: Object_.RequestOptions): core.HttpResponsePromise<SeedExhaustive.types.NestedObjectWithRequiredField>;
    private __getAndReturnNestedWithRequiredFieldAsList;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
