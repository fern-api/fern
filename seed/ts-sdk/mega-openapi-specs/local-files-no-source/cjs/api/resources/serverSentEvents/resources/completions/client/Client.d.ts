import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace CompletionsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class CompletionsClient {
    protected readonly _options: NormalizedClientOptions<CompletionsClient.Options>;
    constructor(options: CompletionsClient.Options);
    /**
     * @param {SeedApi.serverSentEvents.StreamCompletionsRequest} request
     * @param {CompletionsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.serverSentEvents.completions.stream({
     *         query: "foo"
     *     })
     */
    stream(request: SeedApi.serverSentEvents.StreamCompletionsRequest, requestOptions?: CompletionsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __stream;
    /**
     * @param {SeedApi.serverSentEvents.StreamWithoutTerminatorCompletionsRequest} request
     * @param {CompletionsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.serverSentEvents.completions.streamWithoutTerminator({
     *         query: "query"
     *     })
     */
    streamWithoutTerminator(request: SeedApi.serverSentEvents.StreamWithoutTerminatorCompletionsRequest, requestOptions?: CompletionsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __streamWithoutTerminator;
}
