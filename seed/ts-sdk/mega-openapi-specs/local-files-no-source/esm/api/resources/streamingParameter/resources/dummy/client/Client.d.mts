import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace DummyClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class DummyClient {
    protected readonly _options: NormalizedClientOptions<DummyClient.Options>;
    constructor(options: DummyClient.Options);
    /**
     * @param {SeedApi.streamingParameter.GenerateDummyRequest} request
     * @param {DummyClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.streamingParameter.dummy.generate({
     *         stream: false,
     *         num_events: 5
     *     })
     */
    generate(request: SeedApi.streamingParameter.GenerateDummyRequest, requestOptions?: DummyClient.RequestOptions): core.HttpResponsePromise<void>;
    private __generate;
}
