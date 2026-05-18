import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace DummyClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class DummyClient {
    protected readonly _options: NormalizedClientOptions<DummyClient.Options>;
    constructor(options: DummyClient.Options);
    /**
     * @param {SeedApi.streaming.GenerateStreamDummyRequest} request
     * @param {DummyClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.streaming.dummy.generateStream({
     *         stream: true,
     *         num_events: 1
     *     })
     */
    generateStream(request: SeedApi.streaming.GenerateStreamDummyRequest, requestOptions?: DummyClient.RequestOptions): core.HttpResponsePromise<void>;
    private __generateStream;
    /**
     * @param {SeedApi.streaming.GenerateDummyRequest} request
     * @param {DummyClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.streaming.dummy.generate({
     *         stream: false,
     *         num_events: 5
     *     })
     */
    generate(request: SeedApi.streaming.GenerateDummyRequest, requestOptions?: DummyClient.RequestOptions): core.HttpResponsePromise<SeedApi.streaming.StreamResponse>;
    private __generate;
}
