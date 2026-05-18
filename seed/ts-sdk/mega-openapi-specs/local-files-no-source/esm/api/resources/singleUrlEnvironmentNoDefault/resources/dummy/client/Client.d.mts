import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
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
     *     await client.singleUrlEnvironmentNoDefault.dummy.getDummy()
     */
    getDummy(requestOptions?: DummyClient.RequestOptions): core.HttpResponsePromise<string>;
    private __getDummy;
}
