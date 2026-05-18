import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace HeadersClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class HeadersClient {
    protected readonly _options: NormalizedClientOptions<HeadersClient.Options>;
    constructor(options: HeadersClient.Options);
    /**
     * @param {SeedApi.literal.SendHeadersRequest} request
     * @param {HeadersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.literal.headers.send({
     *         "X-Endpoint-Version": "02-12-2024",
     *         "X-Async": true,
     *         query: "What is the weather today"
     *     })
     */
    send(request: SeedApi.literal.SendHeadersRequest, requestOptions?: HeadersClient.RequestOptions): core.HttpResponsePromise<SeedApi.literal.SendResponse>;
    private __send;
}
