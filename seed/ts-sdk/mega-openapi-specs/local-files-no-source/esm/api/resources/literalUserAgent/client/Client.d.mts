import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { LiteralUserAgentClient as LiteralUserAgentClient_ } from "../resources/literalUserAgent/client/Client.mjs";
export declare namespace LiteralUserAgentClient {
    type Options = BaseClientOptions;
}
export declare class LiteralUserAgentClient {
    protected readonly _options: NormalizedClientOptions<LiteralUserAgentClient.Options>;
    protected _literalUserAgent: LiteralUserAgentClient_ | undefined;
    constructor(options: LiteralUserAgentClient.Options);
    get literalUserAgent(): LiteralUserAgentClient_;
}
