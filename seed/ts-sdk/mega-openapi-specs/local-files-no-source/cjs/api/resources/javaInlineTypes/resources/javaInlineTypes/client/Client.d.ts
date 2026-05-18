import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace JavaInlineTypesClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class JavaInlineTypesClient {
    protected readonly _options: NormalizedClientOptions<JavaInlineTypesClient.Options>;
    constructor(options: JavaInlineTypesClient.Options);
    /**
     * @param {SeedApi.javaInlineTypes.GetRootRequest} request
     * @param {JavaInlineTypesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaInlineTypes.javaInlineTypes.getRoot({
     *         bar: {
     *             foo: "foo"
     *         },
     *         foo: "foo"
     *     })
     */
    getRoot(request: SeedApi.javaInlineTypes.GetRootRequest, requestOptions?: JavaInlineTypesClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaInlineTypes.RootType1>;
    private __getRoot;
    /**
     * @param {SeedApi.javaInlineTypes.GetDiscriminatedUnionRequest} request
     * @param {JavaInlineTypesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaInlineTypes.javaInlineTypes.getDiscriminatedUnion({
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
    getDiscriminatedUnion(request: SeedApi.javaInlineTypes.GetDiscriminatedUnionRequest, requestOptions?: JavaInlineTypesClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getDiscriminatedUnion;
    /**
     * @param {SeedApi.javaInlineTypes.GetUndiscriminatedUnionRequest} request
     * @param {JavaInlineTypesClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaInlineTypes.javaInlineTypes.getUndiscriminatedUnion({
     *         bar: "SUNNY",
     *         foo: "foo"
     *     })
     */
    getUndiscriminatedUnion(request: SeedApi.javaInlineTypes.GetUndiscriminatedUnionRequest, requestOptions?: JavaInlineTypesClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getUndiscriminatedUnion;
}
