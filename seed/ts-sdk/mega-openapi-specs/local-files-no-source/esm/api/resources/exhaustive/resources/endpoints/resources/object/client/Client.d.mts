import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../../../BaseClient.mjs";
import * as core from "../../../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../../../index.mjs";
export declare namespace ObjectClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ObjectClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<ObjectClient.Options>;
    constructor(options: ObjectClient.Options);
    /**
     * @param {SeedApi.exhaustive.TypesObjectWithOptionalField} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.object.getAndReturnWithOptionalField({})
     */
    getAndReturnWithOptionalField(request: SeedApi.exhaustive.TypesObjectWithOptionalField, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.exhaustive.TypesObjectWithOptionalField>;
    private __getAndReturnWithOptionalField;
    /**
     * @param {SeedApi.exhaustive.TypesObjectWithRequiredField} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.object.getAndReturnWithRequiredField({
     *         string: "uploaded"
     *     })
     */
    getAndReturnWithRequiredField(request: SeedApi.exhaustive.TypesObjectWithRequiredField, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.exhaustive.TypesObjectWithRequiredField>;
    private __getAndReturnWithRequiredField;
    /**
     * @param {SeedApi.exhaustive.TypesObjectWithMapOfMap} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.object.getAndReturnWithMapOfMap({
     *         map: {
     *             "key": {
     *                 "key": "value"
     *             }
     *         }
     *     })
     */
    getAndReturnWithMapOfMap(request: SeedApi.exhaustive.TypesObjectWithMapOfMap, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.exhaustive.TypesObjectWithMapOfMap>;
    private __getAndReturnWithMapOfMap;
    /**
     * @param {SeedApi.exhaustive.TypesNestedObjectWithOptionalField} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.object.getAndReturnNestedWithOptionalField({})
     */
    getAndReturnNestedWithOptionalField(request: SeedApi.exhaustive.TypesNestedObjectWithOptionalField, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.exhaustive.TypesNestedObjectWithOptionalField>;
    private __getAndReturnNestedWithOptionalField;
    /**
     * @param {SeedApi.exhaustive.endpoints.GetAndReturnNestedWithRequiredFieldObjectRequest} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.object.getAndReturnNestedWithRequiredField({
     *         string: "string",
     *         body: {
     *             string: "string",
     *             NestedObject: {}
     *         }
     *     })
     */
    getAndReturnNestedWithRequiredField(request: SeedApi.exhaustive.endpoints.GetAndReturnNestedWithRequiredFieldObjectRequest, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.exhaustive.TypesNestedObjectWithRequiredField>;
    private __getAndReturnNestedWithRequiredField;
    /**
     * @param {SeedApi.exhaustive.TypesNestedObjectWithRequiredField[]} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.object.getAndReturnNestedWithRequiredFieldAsList([{
     *             string: "string",
     *             NestedObject: {}
     *         }])
     */
    getAndReturnNestedWithRequiredFieldAsList(request: SeedApi.exhaustive.TypesNestedObjectWithRequiredField[], requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.exhaustive.TypesNestedObjectWithRequiredField>;
    private __getAndReturnNestedWithRequiredFieldAsList;
    /**
     * @param {SeedApi.exhaustive.TypesObjectWithUnknownField} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.object.getAndReturnWithUnknownField({
     *         unknown: {
     *             "$ref": "https://example.com/schema"
     *         }
     *     })
     */
    getAndReturnWithUnknownField(request: SeedApi.exhaustive.TypesObjectWithUnknownField, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.exhaustive.TypesObjectWithUnknownField>;
    private __getAndReturnWithUnknownField;
    /**
     * @param {SeedApi.exhaustive.TypesObjectWithDocumentedUnknownType} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.object.getAndReturnWithDocumentedUnknownType({
     *         documentedUnknownType: {
     *             "key": "value"
     *         }
     *     })
     */
    getAndReturnWithDocumentedUnknownType(request: SeedApi.exhaustive.TypesObjectWithDocumentedUnknownType, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.exhaustive.TypesObjectWithDocumentedUnknownType>;
    private __getAndReturnWithDocumentedUnknownType;
    /**
     * @param {SeedApi.exhaustive.TypesMapOfDocumentedUnknownType} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.object.getAndReturnMapOfDocumentedUnknownType({})
     */
    getAndReturnMapOfDocumentedUnknownType(request: SeedApi.exhaustive.TypesMapOfDocumentedUnknownType, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.exhaustive.TypesMapOfDocumentedUnknownType>;
    private __getAndReturnMapOfDocumentedUnknownType;
    /**
     * Tests that dynamic snippets include all required properties in the
     * object initializer, even when the example omits some required fields.
     *
     * @param {SeedApi.exhaustive.TypesObjectWithMixedRequiredAndOptionalFields} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.object.getAndReturnWithMixedRequiredAndOptionalFields({
     *         requiredString: "hello",
     *         requiredInteger: 0,
     *         optionalString: "world",
     *         requiredLong: 0
     *     })
     */
    getAndReturnWithMixedRequiredAndOptionalFields(request: SeedApi.exhaustive.TypesObjectWithMixedRequiredAndOptionalFields, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.exhaustive.TypesObjectWithMixedRequiredAndOptionalFields>;
    private __getAndReturnWithMixedRequiredAndOptionalFields;
    /**
     * Tests that dynamic snippets recursively construct default objects for
     * required properties whose type is a named object. When the example
     * omits the nested object, the generator should construct a default
     * initializer with the nested object's required properties filled in.
     *
     * @param {SeedApi.exhaustive.TypesObjectWithRequiredNestedObject} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.object.getAndReturnWithRequiredNestedObject({
     *         requiredString: "hello",
     *         requiredObject: {
     *             string: "nested",
     *             NestedObject: {}
     *         }
     *     })
     */
    getAndReturnWithRequiredNestedObject(request: SeedApi.exhaustive.TypesObjectWithRequiredNestedObject, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.exhaustive.TypesObjectWithRequiredNestedObject>;
    private __getAndReturnWithRequiredNestedObject;
    /**
     * Tests that string fields containing datetime-like values are NOT reformatted.
     * The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
     * without being converted to "2023-08-31T14:15:22.000Z".
     *
     * @param {SeedApi.exhaustive.TypesObjectWithDatetimeLikeString} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.object.getAndReturnWithDatetimeLikeString({
     *         datetimeLikeString: "2023-08-31T14:15:22Z",
     *         actualDatetime: "2023-08-31T14:15:22Z"
     *     })
     */
    getAndReturnWithDatetimeLikeString(request: SeedApi.exhaustive.TypesObjectWithDatetimeLikeString, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.exhaustive.TypesObjectWithDatetimeLikeString>;
    private __getAndReturnWithDatetimeLikeString;
}
