import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type { NestedObjectWithOptionalField } from "../../../../types/resources/object/types/NestedObjectWithOptionalField.js";
import type { NestedObjectWithRequiredField } from "../../../../types/resources/object/types/NestedObjectWithRequiredField.js";
import type { ObjectWithMapOfMap } from "../../../../types/resources/object/types/ObjectWithMapOfMap.js";
import type { ObjectWithOptionalField } from "../../../../types/resources/object/types/ObjectWithOptionalField.js";
import type { ObjectWithRequiredField } from "../../../../types/resources/object/types/ObjectWithRequiredField.js";
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
     * @param {ObjectWithOptionalField} request
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
    getAndReturnWithOptionalField(request: ObjectWithOptionalField, requestOptions?: Object_.RequestOptions): core.HttpResponsePromise<ObjectWithOptionalField>;
    private __getAndReturnWithOptionalField;
    /**
     * @param {ObjectWithRequiredField} request
     * @param {Object_.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnWithRequiredField({
     *         string: "string"
     *     })
     */
    getAndReturnWithRequiredField(request: ObjectWithRequiredField, requestOptions?: Object_.RequestOptions): core.HttpResponsePromise<ObjectWithRequiredField>;
    private __getAndReturnWithRequiredField;
    /**
     * @param {ObjectWithMapOfMap} request
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
    getAndReturnWithMapOfMap(request: ObjectWithMapOfMap, requestOptions?: Object_.RequestOptions): core.HttpResponsePromise<ObjectWithMapOfMap>;
    private __getAndReturnWithMapOfMap;
    /**
     * @param {NestedObjectWithOptionalField} request
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
    getAndReturnNestedWithOptionalField(request: NestedObjectWithOptionalField, requestOptions?: Object_.RequestOptions): core.HttpResponsePromise<NestedObjectWithOptionalField>;
    private __getAndReturnNestedWithOptionalField;
    /**
     * @param {string} string_
     * @param {NestedObjectWithRequiredField} request
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
    getAndReturnNestedWithRequiredField(string_: string, request: NestedObjectWithRequiredField, requestOptions?: Object_.RequestOptions): core.HttpResponsePromise<NestedObjectWithRequiredField>;
    private __getAndReturnNestedWithRequiredField;
    /**
     * @param {NestedObjectWithRequiredField[]} request
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
    getAndReturnNestedWithRequiredFieldAsList(request: NestedObjectWithRequiredField[], requestOptions?: Object_.RequestOptions): core.HttpResponsePromise<NestedObjectWithRequiredField>;
    private __getAndReturnNestedWithRequiredFieldAsList;
    protected _getAuthorizationHeader(): Promise<string | undefined>;
}
