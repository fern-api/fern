import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace TsInlineTypesClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class TsInlineTypesClient {
    protected readonly _options: NormalizedClientOptions<TsInlineTypesClient.Options>;
    constructor(options: TsInlineTypesClient.Options);
    /**
     * @param {SeedApi.tsInlineTypes.GetRootRequest} request
     * @param {TsInlineTypesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.tsInlineTypes.tsInlineTypes.getRoot({
     *         bar: {
     *             foo: "foo"
     *         },
     *         foo: "foo"
     *     })
     */
    getRoot(request: SeedApi.tsInlineTypes.GetRootRequest, requestOptions?: TsInlineTypesClient.RequestOptions): core.HttpResponsePromise<SeedApi.tsInlineTypes.RootType1>;
    private __getRoot;
    /**
     * @param {SeedApi.tsInlineTypes.GetDiscriminatedUnionRequest} request
     * @param {TsInlineTypesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.tsInlineTypes.tsInlineTypes.getDiscriminatedUnion({
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
    getDiscriminatedUnion(request: SeedApi.tsInlineTypes.GetDiscriminatedUnionRequest, requestOptions?: TsInlineTypesClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getDiscriminatedUnion;
    /**
     * @param {SeedApi.tsInlineTypes.GetUndiscriminatedUnionRequest} request
     * @param {TsInlineTypesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.tsInlineTypes.tsInlineTypes.getUndiscriminatedUnion({
     *         bar: "SUNNY",
     *         foo: "foo"
     *     })
     */
    getUndiscriminatedUnion(request: SeedApi.tsInlineTypes.GetUndiscriminatedUnionRequest, requestOptions?: TsInlineTypesClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getUndiscriminatedUnion;
}
