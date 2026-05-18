import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import * as SeedApi from "../../../../../index.mjs";
export declare namespace DummyClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class DummyClient {
    protected readonly _options: NormalizedClientOptions<DummyClient.Options>;
    constructor(options: DummyClient.Options);
    /**
     * @param {SeedApi.javaStreamingAcceptHeader.GenerateStreamDummyRequest} request
     * @param {DummyClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.javaStreamingAcceptHeader.BadRequestError}
     *
     * @example
     *     await client.javaStreamingAcceptHeader.dummy.generateStream({
     *         num_events: 1
     *     })
     */
    generateStream(request: SeedApi.javaStreamingAcceptHeader.GenerateStreamDummyRequest, requestOptions?: DummyClient.RequestOptions): core.HttpResponsePromise<void>;
    private __generateStream;
    /**
     * @param {SeedApi.javaStreamingAcceptHeader.GenerateDummyRequest} request
     * @param {DummyClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.javaStreamingAcceptHeader.BadRequestError}
     *
     * @example
     *     await client.javaStreamingAcceptHeader.dummy.generate({
     *         num_events: 5
     *     })
     */
    generate(request: SeedApi.javaStreamingAcceptHeader.GenerateDummyRequest, requestOptions?: DummyClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaStreamingAcceptHeader.StreamResponse>;
    private __generate;
}
