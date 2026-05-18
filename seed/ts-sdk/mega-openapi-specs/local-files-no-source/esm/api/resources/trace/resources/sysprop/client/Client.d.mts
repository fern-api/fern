import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace SyspropClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class SyspropClient {
    protected readonly _options: NormalizedClientOptions<SyspropClient.Options>;
    constructor(options: SyspropClient.Options);
    /**
     * @param {SeedApi.trace.SetNumWarmInstancesSyspropRequest} request
     * @param {SyspropClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.sysprop.setNumWarmInstances({
     *         language: "JAVA",
     *         numWarmInstances: 1
     *     })
     */
    setNumWarmInstances(request: SeedApi.trace.SetNumWarmInstancesSyspropRequest, requestOptions?: SyspropClient.RequestOptions): core.HttpResponsePromise<void>;
    private __setNumWarmInstances;
    /**
     * @param {SyspropClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.trace.sysprop.getNumWarmInstances()
     */
    getNumWarmInstances(requestOptions?: SyspropClient.RequestOptions): core.HttpResponsePromise<Record<string, number>>;
    private __getNumWarmInstances;
}
