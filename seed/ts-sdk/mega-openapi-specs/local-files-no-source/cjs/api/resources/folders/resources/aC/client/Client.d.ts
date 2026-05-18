import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
export declare namespace ACClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ACClient {
    protected readonly _options: NormalizedClientOptions<ACClient.Options>;
    constructor(options: ACClient.Options);
    /**
     * @param {ACClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.folders.aC.aCFoo()
     */
    aCFoo(requestOptions?: ACClient.RequestOptions): core.HttpResponsePromise<void>;
    private __aCFoo;
}
