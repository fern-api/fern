import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace QueryClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class QueryClient {
    protected readonly _options: NormalizedClientOptions<QueryClient.Options>;
    constructor(options: QueryClient.Options);
    /**
     * @param {SeedApi.literal.SendQueryRequest} request
     * @param {QueryClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.literal.query.send({
     *         prompt: "You are a helpful assistant",
     *         alias_prompt: "You are a helpful assistant",
     *         query: "What is the weather today",
     *         stream: true,
     *         alias_stream: true
     *     })
     */
    send(request: SeedApi.literal.SendQueryRequest, requestOptions?: QueryClient.RequestOptions): core.HttpResponsePromise<SeedApi.literal.SendResponse>;
    private __send;
}
