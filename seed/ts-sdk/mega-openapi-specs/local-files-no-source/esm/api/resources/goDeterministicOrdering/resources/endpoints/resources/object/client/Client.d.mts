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
     * @param {SeedApi.goDeterministicOrdering.TypesObjectWithOptionalField} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.object.getAndReturnWithOptionalField({})
     */
    getAndReturnWithOptionalField(request: SeedApi.goDeterministicOrdering.TypesObjectWithOptionalField, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.TypesObjectWithOptionalField>;
    private __getAndReturnWithOptionalField;
    /**
     * @param {SeedApi.goDeterministicOrdering.TypesObjectWithRequiredField} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.object.getAndReturnWithRequiredField({
     *         string: "uploaded"
     *     })
     */
    getAndReturnWithRequiredField(request: SeedApi.goDeterministicOrdering.TypesObjectWithRequiredField, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.TypesObjectWithRequiredField>;
    private __getAndReturnWithRequiredField;
    /**
     * @param {SeedApi.goDeterministicOrdering.TypesObjectWithMapOfMap} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.object.getAndReturnWithMapOfMap({
     *         map: {
     *             "key": {
     *                 "key": "value"
     *             }
     *         }
     *     })
     */
    getAndReturnWithMapOfMap(request: SeedApi.goDeterministicOrdering.TypesObjectWithMapOfMap, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.TypesObjectWithMapOfMap>;
    private __getAndReturnWithMapOfMap;
    /**
     * @param {SeedApi.goDeterministicOrdering.TypesNestedObjectWithOptionalField} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.object.getAndReturnNestedWithOptionalField({})
     */
    getAndReturnNestedWithOptionalField(request: SeedApi.goDeterministicOrdering.TypesNestedObjectWithOptionalField, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.TypesNestedObjectWithOptionalField>;
    private __getAndReturnNestedWithOptionalField;
    /**
     * @param {SeedApi.goDeterministicOrdering.endpoints.GetAndReturnNestedWithRequiredFieldObjectRequest} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.object.getAndReturnNestedWithRequiredField({
     *         string: "string",
     *         body: {
     *             string: "string",
     *             NestedObject: {}
     *         }
     *     })
     */
    getAndReturnNestedWithRequiredField(request: SeedApi.goDeterministicOrdering.endpoints.GetAndReturnNestedWithRequiredFieldObjectRequest, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.TypesNestedObjectWithRequiredField>;
    private __getAndReturnNestedWithRequiredField;
    /**
     * @param {SeedApi.goDeterministicOrdering.TypesNestedObjectWithRequiredField[]} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.object.getAndReturnNestedWithRequiredFieldAsList([{
     *             string: "string",
     *             NestedObject: {}
     *         }])
     */
    getAndReturnNestedWithRequiredFieldAsList(request: SeedApi.goDeterministicOrdering.TypesNestedObjectWithRequiredField[], requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.TypesNestedObjectWithRequiredField>;
    private __getAndReturnNestedWithRequiredFieldAsList;
    /**
     * @param {SeedApi.goDeterministicOrdering.TypesObjectWithUnknownField} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.object.getAndReturnWithUnknownField({
     *         unknown: {
     *             "$ref": "https://example.com/schema"
     *         }
     *     })
     */
    getAndReturnWithUnknownField(request: SeedApi.goDeterministicOrdering.TypesObjectWithUnknownField, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.TypesObjectWithUnknownField>;
    private __getAndReturnWithUnknownField;
    /**
     * Tests that string fields containing datetime-like values are NOT reformatted.
     * The datetimeLikeString field should preserve its exact value "2023-08-31T14:15:22Z"
     * without being converted to "2023-08-31T14:15:22.000Z".
     *
     * @param {SeedApi.goDeterministicOrdering.TypesObjectWithDatetimeLikeString} request
     * @param {ObjectClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.object.getAndReturnWithDatetimeLikeString({
     *         datetimeLikeString: "2023-08-31T14:15:22Z",
     *         actualDatetime: "2023-08-31T14:15:22Z"
     *     })
     */
    getAndReturnWithDatetimeLikeString(request: SeedApi.goDeterministicOrdering.TypesObjectWithDatetimeLikeString, requestOptions?: ObjectClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.TypesObjectWithDatetimeLikeString>;
    private __getAndReturnWithDatetimeLikeString;
}
