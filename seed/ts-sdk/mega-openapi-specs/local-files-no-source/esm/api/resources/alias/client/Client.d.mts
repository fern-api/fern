import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { AliasClient as AliasClient_ } from "../resources/alias/client/Client.mjs";
export declare namespace AliasClient {
    type Options = BaseClientOptions;
}
export declare class AliasClient {
    protected readonly _options: NormalizedClientOptions<AliasClient.Options>;
    protected _alias: AliasClient_ | undefined;
    constructor(options: AliasClient.Options);
    get alias(): AliasClient_;
}
