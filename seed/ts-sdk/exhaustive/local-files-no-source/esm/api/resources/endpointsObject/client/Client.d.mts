import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.mjs";
import * as core from "../../../../core/index.mjs";
import type * as SeedApi from "../../../index.mjs";
export declare namespace EndpointsObjectClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class EndpointsObjectClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<EndpointsObjectClient.Options>;
    constructor(options: EndpointsObjectClient.Options);
    /**
     * @param {SeedApi.TypesObjectWithOptionalField} request
     * @param {EndpointsObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsObject.endpointsObjectGetAndReturnWithOptionalField({})
     */
    endpointsObjectGetAndReturnWithOptionalField(request: SeedApi.TypesObjectWithOptionalField, requestOptions?: EndpointsObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithOptionalField>;
    private __endpointsObjectGetAndReturnWithOptionalField;
    /**
     * @param {SeedApi.TypesObjectWithRequiredField} request
     * @param {EndpointsObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsObject.endpointsObjectGetAndReturnWithRequiredField({
     *         string: "string"
     *     })
     */
    endpointsObjectGetAndReturnWithRequiredField(request: SeedApi.TypesObjectWithRequiredField, requestOptions?: EndpointsObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithRequiredField>;
    private __endpointsObjectGetAndReturnWithRequiredField;
    /**
     * @param {SeedApi.TypesObjectWithMapOfMap} request
     * @param {EndpointsObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsObject.endpointsObjectGetAndReturnWithMapOfMap({
     *         map: {
     *             "key": {
     *                 "key": "value"
     *             }
     *         }
     *     })
     */
    endpointsObjectGetAndReturnWithMapOfMap(request: SeedApi.TypesObjectWithMapOfMap, requestOptions?: EndpointsObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithMapOfMap>;
    private __endpointsObjectGetAndReturnWithMapOfMap;
    /**
     * @param {SeedApi.TypesNestedObjectWithOptionalField} request
     * @param {EndpointsObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsObject.endpointsObjectGetAndReturnNestedWithOptionalField({})
     */
    endpointsObjectGetAndReturnNestedWithOptionalField(request: SeedApi.TypesNestedObjectWithOptionalField, requestOptions?: EndpointsObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesNestedObjectWithOptionalField>;
    private __endpointsObjectGetAndReturnNestedWithOptionalField;
    /**
     * @param {SeedApi.EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest} request
     * @param {EndpointsObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsObject.endpointsObjectGetAndReturnNestedWithRequiredField({
     *         string: "string",
     *         body: {
     *             string: "string",
     *             NestedObject: {}
     *         }
     *     })
     */
    endpointsObjectGetAndReturnNestedWithRequiredField(request: SeedApi.EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest, requestOptions?: EndpointsObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesNestedObjectWithRequiredField>;
    private __endpointsObjectGetAndReturnNestedWithRequiredField;
    /**
     * @param {SeedApi.TypesNestedObjectWithRequiredField[]} request
     * @param {EndpointsObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsObject.endpointsObjectGetAndReturnNestedWithRequiredFieldAsList([{
     *             string: "string",
     *             NestedObject: {}
     *         }])
     */
    endpointsObjectGetAndReturnNestedWithRequiredFieldAsList(request: SeedApi.TypesNestedObjectWithRequiredField[], requestOptions?: EndpointsObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesNestedObjectWithRequiredField>;
    private __endpointsObjectGetAndReturnNestedWithRequiredFieldAsList;
    /**
     * @param {SeedApi.TypesObjectWithUnknownField} request
     * @param {EndpointsObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsObject.endpointsObjectGetAndReturnWithUnknownField({
     *         unknown: {
     *             "key": "value"
     *         }
     *     })
     */
    endpointsObjectGetAndReturnWithUnknownField(request: SeedApi.TypesObjectWithUnknownField, requestOptions?: EndpointsObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithUnknownField>;
    private __endpointsObjectGetAndReturnWithUnknownField;
    /**
     * @param {SeedApi.TypesObjectWithDocumentedUnknownType} request
     * @param {EndpointsObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsObject.endpointsObjectGetAndReturnWithDocumentedUnknownType({
     *         documentedUnknownType: {
     *             "key": "value"
     *         }
     *     })
     */
    endpointsObjectGetAndReturnWithDocumentedUnknownType(request: SeedApi.TypesObjectWithDocumentedUnknownType, requestOptions?: EndpointsObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithDocumentedUnknownType>;
    private __endpointsObjectGetAndReturnWithDocumentedUnknownType;
    /**
     * @param {SeedApi.TypesMapOfDocumentedUnknownType} request
     * @param {EndpointsObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsObject.endpointsObjectGetAndReturnMapOfDocumentedUnknownType({})
     */
    endpointsObjectGetAndReturnMapOfDocumentedUnknownType(request: SeedApi.TypesMapOfDocumentedUnknownType, requestOptions?: EndpointsObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesMapOfDocumentedUnknownType>;
    private __endpointsObjectGetAndReturnMapOfDocumentedUnknownType;
    /**
     * Tests that dynamic snippets include all required properties in the
     * object initializer, even when the example omits some required fields.
     *
     * @param {SeedApi.TypesObjectWithMixedRequiredAndOptionalFields} request
     * @param {EndpointsObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsObject.endpointsObjectGetAndReturnWithMixedRequiredAndOptionalFields({
     *         requiredString: "requiredString",
     *         requiredInteger: 1,
     *         requiredLong: 1000000
     *     })
     */
    endpointsObjectGetAndReturnWithMixedRequiredAndOptionalFields(request: SeedApi.TypesObjectWithMixedRequiredAndOptionalFields, requestOptions?: EndpointsObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithMixedRequiredAndOptionalFields>;
    private __endpointsObjectGetAndReturnWithMixedRequiredAndOptionalFields;
    /**
     * Tests that dynamic snippets recursively construct default objects for
     * required properties whose type is a named object. When the example
     * omits the nested object, the generator should construct a default
     * initializer with the nested object's required properties filled in.
     *
     * @param {SeedApi.TypesObjectWithRequiredNestedObject} request
     * @param {EndpointsObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsObject.endpointsObjectGetAndReturnWithRequiredNestedObject({
     *         requiredString: "requiredString",
     *         requiredObject: {
     *             string: "string",
     *             NestedObject: {}
     *         }
     *     })
     */
    endpointsObjectGetAndReturnWithRequiredNestedObject(request: SeedApi.TypesObjectWithRequiredNestedObject, requestOptions?: EndpointsObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithRequiredNestedObject>;
    private __endpointsObjectGetAndReturnWithRequiredNestedObject;
    /**
     * Tests that string fields containing datetime-like values are NOT reformatted.
     * The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
     * without being converted to "2023-08-31T14:15:22.000Z".
     *
     * @param {SeedApi.TypesObjectWithDatetimeLikeString} request
     * @param {EndpointsObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsObject.endpointsObjectGetAndReturnWithDatetimeLikeString({
     *         datetimeLikeString: "datetimeLikeString",
     *         actualDatetime: "2024-01-15T09:30:00Z"
     *     })
     */
    endpointsObjectGetAndReturnWithDatetimeLikeString(request: SeedApi.TypesObjectWithDatetimeLikeString, requestOptions?: EndpointsObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.TypesObjectWithDatetimeLikeString>;
    private __endpointsObjectGetAndReturnWithDatetimeLikeString;
}
