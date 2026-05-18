import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
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
