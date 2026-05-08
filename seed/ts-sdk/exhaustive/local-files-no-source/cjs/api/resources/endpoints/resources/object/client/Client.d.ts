import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace ObjectClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ObjectClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<ObjectClient.Options>;
    constructor(options: ObjectClient.Options);
    /**
     * @param {SeedApi.TypesObjectWithOptionalField} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnWithOptionalField({})
     */
    getAndReturnWithOptionalField(request: SeedApi.TypesObjectWithOptionalField, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithOptionalField>;
    private __getAndReturnWithOptionalField;
    /**
     * @param {SeedApi.TypesObjectWithRequiredField} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnWithRequiredField({
     *         string: "string"
     *     })
     */
    getAndReturnWithRequiredField(request: SeedApi.TypesObjectWithRequiredField, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithRequiredField>;
    private __getAndReturnWithRequiredField;
    /**
     * @param {SeedApi.TypesObjectWithMapOfMap} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnWithMapOfMap({
     *         map: {
     *             "key": {
     *                 "key": "value"
     *             }
     *         }
     *     })
     */
    getAndReturnWithMapOfMap(request: SeedApi.TypesObjectWithMapOfMap, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithMapOfMap>;
    private __getAndReturnWithMapOfMap;
    /**
     * @param {SeedApi.TypesNestedObjectWithOptionalField} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnNestedWithOptionalField({})
     */
    getAndReturnNestedWithOptionalField(request: SeedApi.TypesNestedObjectWithOptionalField, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesNestedObjectWithOptionalField>;
    private __getAndReturnNestedWithOptionalField;
    /**
     * @param {SeedApi.endpoints.GetAndReturnNestedWithRequiredFieldObjectRequest} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnNestedWithRequiredField({
     *         stringValue: "string",
     *         body: {
     *             string: "string",
     *             NestedObject: {}
     *         }
     *     })
     */
    getAndReturnNestedWithRequiredField(request: SeedApi.endpoints.GetAndReturnNestedWithRequiredFieldObjectRequest, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesNestedObjectWithRequiredField>;
    private __getAndReturnNestedWithRequiredField;
    /**
     * @param {SeedApi.TypesNestedObjectWithRequiredField[]} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnNestedWithRequiredFieldAsList([{
     *             string: "string",
     *             NestedObject: {}
     *         }])
     */
    getAndReturnNestedWithRequiredFieldAsList(request: SeedApi.TypesNestedObjectWithRequiredField[], requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesNestedObjectWithRequiredField>;
    private __getAndReturnNestedWithRequiredFieldAsList;
    /**
     * @param {SeedApi.TypesObjectWithUnknownField} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnWithUnknownField({
     *         unknown: {
     *             "key": "value"
     *         }
     *     })
     */
    getAndReturnWithUnknownField(request: SeedApi.TypesObjectWithUnknownField, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithUnknownField>;
    private __getAndReturnWithUnknownField;
    /**
     * @param {SeedApi.TypesObjectWithDocumentedUnknownType} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnWithDocumentedUnknownType({
     *         documentedUnknownType: {
     *             "key": "value"
     *         }
     *     })
     */
    getAndReturnWithDocumentedUnknownType(request: SeedApi.TypesObjectWithDocumentedUnknownType, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithDocumentedUnknownType>;
    private __getAndReturnWithDocumentedUnknownType;
    /**
     * @param {SeedApi.TypesMapOfDocumentedUnknownType} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnMapOfDocumentedUnknownType({})
     */
    getAndReturnMapOfDocumentedUnknownType(request: SeedApi.TypesMapOfDocumentedUnknownType, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesMapOfDocumentedUnknownType>;
    private __getAndReturnMapOfDocumentedUnknownType;
    /**
     * Tests that string fields containing datetime-like values are NOT reformatted.
     * The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
     * without being converted to "2023-08-31T14:15:22.000Z".
     *
     * @param {SeedApi.TypesObjectWithDatetimeLikeString} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.object.getAndReturnWithDatetimeLikeString({
     *         datetimeLikeString: "datetimeLikeString",
     *         actualDatetime: "2024-01-15T09:30:00Z"
     *     })
     */
    getAndReturnWithDatetimeLikeString(request: SeedApi.TypesObjectWithDatetimeLikeString, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithDatetimeLikeString>;
    private __getAndReturnWithDatetimeLikeString;
}
