import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace CsharpInlineTypesClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class CsharpInlineTypesClient {
    protected readonly _options: NormalizedClientOptions<CsharpInlineTypesClient.Options>;
    constructor(options: CsharpInlineTypesClient.Options);
    /**
     * @param {SeedApi.csharpInlineTypes.GetRootRequest} request
     * @param {CsharpInlineTypesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.csharpInlineTypes.csharpInlineTypes.getRoot({
     *         bar: {
     *             foo: "foo"
     *         },
     *         foo: "foo"
     *     })
     */
    getRoot(request: SeedApi.csharpInlineTypes.GetRootRequest, requestOptions?: CsharpInlineTypesClient.RequestOptions): core.HttpResponsePromise<SeedApi.csharpInlineTypes.RootType1>;
    private __getRoot;
    /**
     * @param {SeedApi.csharpInlineTypes.GetDiscriminatedUnionRequest} request
     * @param {CsharpInlineTypesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.csharpInlineTypes.csharpInlineTypes.getDiscriminatedUnion({
     *         bar: {
     *             foo: "foo",
     *             bar: {
     *                 foo: "foo",
     *                 ref: {
     *                     foo: "foo"
     *                 }
     *             },
     *             ref: {
     *                 foo: "foo"
     *             },
     *             type: "type1"
     *         },
     *         foo: "foo"
     *     })
     */
    getDiscriminatedUnion(request: SeedApi.csharpInlineTypes.GetDiscriminatedUnionRequest, requestOptions?: CsharpInlineTypesClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getDiscriminatedUnion;
    /**
     * @param {SeedApi.csharpInlineTypes.GetUndiscriminatedUnionRequest} request
     * @param {CsharpInlineTypesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.csharpInlineTypes.csharpInlineTypes.getUndiscriminatedUnion({
     *         bar: "SUNNY",
     *         foo: "foo"
     *     })
     */
    getUndiscriminatedUnion(request: SeedApi.csharpInlineTypes.GetUndiscriminatedUnionRequest, requestOptions?: CsharpInlineTypesClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getUndiscriminatedUnion;
}
