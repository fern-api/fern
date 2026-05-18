import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import * as SeedApi from "../../../../../index.mjs";
export declare namespace CompletionsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class CompletionsClient {
    protected readonly _options: NormalizedClientOptions<CompletionsClient.Options>;
    constructor(options: CompletionsClient.Options);
    /**
     * @param {SeedApi.serverSentEventExamples.StreamCompletionsRequest} request
     * @param {CompletionsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.serverSentEventExamples.BadRequestError}
     *
     * @example
     *     await client.serverSentEventExamples.completions.stream({
     *         query: "foo"
     *     })
     *
     * @example
     *     await client.serverSentEventExamples.completions.stream({
     *         query: ""
     *     })
     */
    stream(request: SeedApi.serverSentEventExamples.StreamCompletionsRequest, requestOptions?: CompletionsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __stream;
    /**
     * @param {SeedApi.serverSentEventExamples.StreamEventsCompletionsRequest} request
     * @param {CompletionsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.serverSentEventExamples.BadRequestError}
     *
     * @example
     *     await client.serverSentEventExamples.completions.streamEvents({
     *         query: "query"
     *     })
     *
     * @example
     *     await client.serverSentEventExamples.completions.streamEvents({
     *         query: ""
     *     })
     */
    streamEvents(request: SeedApi.serverSentEventExamples.StreamEventsCompletionsRequest, requestOptions?: CompletionsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __streamEvents;
    /**
     * @param {SeedApi.serverSentEventExamples.StreamEventsDiscriminantInDataCompletionsRequest} request
     * @param {CompletionsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.serverSentEventExamples.BadRequestError}
     *
     * @example
     *     await client.serverSentEventExamples.completions.streamEventsDiscriminantInData({
     *         query: "query"
     *     })
     */
    streamEventsDiscriminantInData(request: SeedApi.serverSentEventExamples.StreamEventsDiscriminantInDataCompletionsRequest, requestOptions?: CompletionsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __streamEventsDiscriminantInData;
    /**
     * @param {SeedApi.serverSentEventExamples.StreamEventsContextProtocolCompletionsRequest} request
     * @param {CompletionsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @throws {@link SeedApi.serverSentEventExamples.BadRequestError}
     *
     * @example
     *     await client.serverSentEventExamples.completions.streamEventsContextProtocol({
     *         query: "query"
     *     })
     *
     * @example
     *     await client.serverSentEventExamples.completions.streamEventsContextProtocol({
     *         query: ""
     *     })
     */
    streamEventsContextProtocol(request: SeedApi.serverSentEventExamples.StreamEventsContextProtocolCompletionsRequest, requestOptions?: CompletionsClient.RequestOptions): core.HttpResponsePromise<void>;
    private __streamEventsContextProtocol;
}
