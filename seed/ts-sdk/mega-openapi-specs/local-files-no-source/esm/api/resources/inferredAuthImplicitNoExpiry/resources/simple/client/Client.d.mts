import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
export declare namespace SimpleClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class SimpleClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<SimpleClient.Options>;
    constructor(options: SimpleClient.Options);
    /**
     * @param {SimpleClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.inferredAuthImplicitNoExpiry.simple.getSomething()
     */
    getSomething(requestOptions?: SimpleClient.RequestOptions): core.HttpResponsePromise<void>;
    private __getSomething;
}
