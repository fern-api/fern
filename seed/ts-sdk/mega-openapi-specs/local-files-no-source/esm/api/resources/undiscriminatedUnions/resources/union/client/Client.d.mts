import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace UnionClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class UnionClient {
    protected readonly _options: NormalizedClientOptions<UnionClient.Options>;
    constructor(options: UnionClient.Options);
    /**
     * @param {SeedApi.undiscriminatedUnions.MyUnion} request
     * @param {UnionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.undiscriminatedUnions.union.get("string")
     */
    get(request: SeedApi.undiscriminatedUnions.MyUnion, requestOptions?: UnionClient.RequestOptions): core.HttpResponsePromise<SeedApi.undiscriminatedUnions.MyUnion>;
    private __get;
    /**
     * @param {UnionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.undiscriminatedUnions.union.getMetadata()
     */
    getMetadata(requestOptions?: UnionClient.RequestOptions): core.HttpResponsePromise<SeedApi.undiscriminatedUnions.Metadata>;
    private __getMetadata;
    /**
     * @param {SeedApi.undiscriminatedUnions.MetadataUnion} request
     * @param {UnionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.undiscriminatedUnions.union.updateMetadata({
     *         "string": {
     *             "key": "value"
     *         }
     *     })
     */
    updateMetadata(request: SeedApi.undiscriminatedUnions.MetadataUnion, requestOptions?: UnionClient.RequestOptions): core.HttpResponsePromise<boolean>;
    private __updateMetadata;
    /**
     * @param {SeedApi.undiscriminatedUnions.Request} request
     * @param {UnionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.undiscriminatedUnions.union.call({
     *         union: {
     *             "string": {
     *                 "key": "value"
     *             }
     *         }
     *     })
     */
    call(request?: SeedApi.undiscriminatedUnions.Request, requestOptions?: UnionClient.RequestOptions): core.HttpResponsePromise<boolean>;
    private __call;
    /**
     * @param {SeedApi.undiscriminatedUnions.UnionWithDuplicateTypes} request
     * @param {UnionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.undiscriminatedUnions.union.duplicateTypesUnion("string")
     */
    duplicateTypesUnion(request: SeedApi.undiscriminatedUnions.UnionWithDuplicateTypes, requestOptions?: UnionClient.RequestOptions): core.HttpResponsePromise<SeedApi.undiscriminatedUnions.UnionWithDuplicateTypes>;
    private __duplicateTypesUnion;
    /**
     * @param {SeedApi.undiscriminatedUnions.NestedUnionRoot} request
     * @param {UnionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.undiscriminatedUnions.union.nestedUnions("string")
     */
    nestedUnions(request: SeedApi.undiscriminatedUnions.NestedUnionRoot, requestOptions?: UnionClient.RequestOptions): core.HttpResponsePromise<string>;
    private __nestedUnions;
    /**
     * @param {SeedApi.undiscriminatedUnions.OuterNestedUnion} request
     * @param {UnionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.undiscriminatedUnions.union.nestedObjectUnions("string")
     */
    nestedObjectUnions(request: SeedApi.undiscriminatedUnions.OuterNestedUnion, requestOptions?: UnionClient.RequestOptions): core.HttpResponsePromise<string>;
    private __nestedObjectUnions;
    /**
     * @param {SeedApi.undiscriminatedUnions.AliasedObjectUnion} request
     * @param {UnionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.undiscriminatedUnions.union.aliasedObjectUnion({
     *         "onlyInA": "onlyInA",
     *         "sharedNumber": 1
     *     })
     */
    aliasedObjectUnion(request: SeedApi.undiscriminatedUnions.AliasedObjectUnion, requestOptions?: UnionClient.RequestOptions): core.HttpResponsePromise<string>;
    private __aliasedObjectUnion;
    /**
     * @param {SeedApi.undiscriminatedUnions.UnionWithBaseProperties} request
     * @param {UnionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.undiscriminatedUnions.union.getWithBaseProperties({
     *         name: "name",
     *         value: {
     *             "key": "value"
     *         }
     *     })
     */
    getWithBaseProperties(request: SeedApi.undiscriminatedUnions.UnionWithBaseProperties, requestOptions?: UnionClient.RequestOptions): core.HttpResponsePromise<SeedApi.undiscriminatedUnions.UnionWithBaseProperties>;
    private __getWithBaseProperties;
    /**
     * @param {SeedApi.undiscriminatedUnions.TestCamelCasePropertiesUnionRequest} request
     * @param {UnionClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.undiscriminatedUnions.union.testCamelCaseProperties({
     *         paymentMethod: {
     *             method: "card",
     *             cardNumber: "1234567890123456"
     *         }
     *     })
     */
    testCamelCaseProperties(request: SeedApi.undiscriminatedUnions.TestCamelCasePropertiesUnionRequest, requestOptions?: UnionClient.RequestOptions): core.HttpResponsePromise<string>;
    private __testCamelCaseProperties;
}
