import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { LiteralUserAgentClient as LiteralUserAgentClient_ } from "../resources/literalUserAgent/client/Client.js";
export declare namespace LiteralUserAgentClient {
    type Options = BaseClientOptions;
}
export declare class LiteralUserAgentClient {
    protected readonly _options: NormalizedClientOptions<LiteralUserAgentClient.Options>;
    protected _literalUserAgent: LiteralUserAgentClient_ | undefined;
    constructor(options: LiteralUserAgentClient.Options);
    get literalUserAgent(): LiteralUserAgentClient_;
}
