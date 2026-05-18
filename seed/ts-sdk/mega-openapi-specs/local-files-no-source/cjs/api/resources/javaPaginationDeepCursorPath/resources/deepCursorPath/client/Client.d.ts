import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace DeepCursorPathClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class DeepCursorPathClient {
    protected readonly _options: NormalizedClientOptions<DeepCursorPathClient.Options>;
    constructor(options: DeepCursorPathClient.Options);
    /**
     * @param {SeedApi.javaPaginationDeepCursorPath.A} request
     * @param {DeepCursorPathClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaPaginationDeepCursorPath.deepCursorPath.doThing({})
     */
    doThing(request: SeedApi.javaPaginationDeepCursorPath.A, requestOptions?: DeepCursorPathClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaPaginationDeepCursorPath.Response>;
    private __doThing;
    /**
     * @param {SeedApi.javaPaginationDeepCursorPath.MainRequired} request
     * @param {DeepCursorPathClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaPaginationDeepCursorPath.deepCursorPath.doThingRequired({
     *         indirection: {
     *             results: ["results"]
     *         }
     *     })
     */
    doThingRequired(request: SeedApi.javaPaginationDeepCursorPath.MainRequired, requestOptions?: DeepCursorPathClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaPaginationDeepCursorPath.Response>;
    private __doThingRequired;
    /**
     * @param {SeedApi.javaPaginationDeepCursorPath.InlineA} request
     * @param {DeepCursorPathClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaPaginationDeepCursorPath.deepCursorPath.doThingInline()
     */
    doThingInline(request?: SeedApi.javaPaginationDeepCursorPath.InlineA, requestOptions?: DeepCursorPathClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaPaginationDeepCursorPath.Response>;
    private __doThingInline;
}
