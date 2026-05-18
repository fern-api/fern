import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { AliasClient as AliasClient_ } from "../resources/alias/client/Client.js";
export declare namespace AliasClient {
    type Options = BaseClientOptions;
}
export declare class AliasClient {
    protected readonly _options: NormalizedClientOptions<AliasClient.Options>;
    protected _alias: AliasClient_ | undefined;
    constructor(options: AliasClient.Options);
    get alias(): AliasClient_;
}
