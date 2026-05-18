import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
export declare namespace LiteralUserAgentClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class LiteralUserAgentClient {
    protected readonly _options: NormalizedClientOptions<LiteralUserAgentClient.Options>;
    constructor(options: LiteralUserAgentClient.Options);
    /**
     * @param {LiteralUserAgentClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.literalUserAgent.literalUserAgent.ping()
     */
    ping(requestOptions?: LiteralUserAgentClient.RequestOptions): core.HttpResponsePromise<string>;
    private __ping;
}
