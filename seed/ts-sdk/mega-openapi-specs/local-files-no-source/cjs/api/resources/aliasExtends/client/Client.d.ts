import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { AliasExtendsClient as AliasExtendsClient_ } from "../resources/aliasExtends/client/Client.js";
export declare namespace AliasExtendsClient {
    type Options = BaseClientOptions;
}
export declare class AliasExtendsClient {
    protected readonly _options: NormalizedClientOptions<AliasExtendsClient.Options>;
    protected _aliasExtends: AliasExtendsClient_ | undefined;
    constructor(options: AliasExtendsClient.Options);
    get aliasExtends(): AliasExtendsClient_;
}
