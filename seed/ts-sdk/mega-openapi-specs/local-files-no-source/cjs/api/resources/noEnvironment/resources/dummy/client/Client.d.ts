import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
export declare namespace DummyClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class DummyClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<DummyClient.Options>;
    constructor(options: DummyClient.Options);
    /**
     * @param {DummyClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.noEnvironment.dummy.getDummy()
     */
    getDummy(requestOptions?: DummyClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getDummy;
}
