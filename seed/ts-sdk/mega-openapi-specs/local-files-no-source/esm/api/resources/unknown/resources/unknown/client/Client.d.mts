import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace UnknownClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class UnknownClient {
    protected readonly _options: NormalizedClientOptions<UnknownClient.Options>;
    constructor(options: UnknownClient.Options);
    /**
     * @param {unknown} request
     * @param {UnknownClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.unknown.unknown.post({
     *         "key": "value"
     *     })
     */
    post(request?: unknown, requestOptions?: UnknownClient.RequestOptions): core.HttpResponsePromise<unknown[]>;
    private __post;
    /**
     * @param {SeedApi.unknown.MyObject} request
     * @param {UnknownClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.unknown.unknown.postObject({
     *         unknown: {
     *             "key": "value"
     *         }
     *     })
     */
    postObject(request: SeedApi.unknown.MyObject, requestOptions?: UnknownClient.RequestOptions): core.HttpResponsePromise<unknown[]>;
    private __postObject;
}
