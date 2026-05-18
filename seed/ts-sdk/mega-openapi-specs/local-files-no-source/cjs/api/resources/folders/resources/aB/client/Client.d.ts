import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
export declare namespace ABClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ABClient {
    protected readonly _options: NormalizedClientOptions<ABClient.Options>;
    constructor(options: ABClient.Options);
    /**
     * @param {ABClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.folders.aB.aBFoo()
     */
    aBFoo(requestOptions?: ABClient.RequestOptions): core.HttpResponsePromise<void>;
    private __aBFoo;
}
