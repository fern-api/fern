import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace HeadersClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class HeadersClient {
    protected readonly _options: NormalizedClientOptions<HeadersClient.Options>;
    constructor(options: HeadersClient.Options);
    /**
     * @param {SeedApi.enum_.SendHeadersRequest} request
     * @param {HeadersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.enum.headers.send({
     *         operand: ">",
     *         operandOrColor: "red"
     *     })
     */
    send(request: SeedApi.enum_.SendHeadersRequest, requestOptions?: HeadersClient.RequestOptions): core.HttpResponsePromise<void>;
    private __send;
}
