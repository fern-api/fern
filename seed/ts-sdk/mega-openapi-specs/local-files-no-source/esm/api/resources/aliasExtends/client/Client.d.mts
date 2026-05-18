import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { AliasExtendsClient as AliasExtendsClient_ } from "../resources/aliasExtends/client/Client.mjs";
export declare namespace AliasExtendsClient {
    type Options = BaseClientOptions;
}
export declare class AliasExtendsClient {
    protected readonly _options: NormalizedClientOptions<AliasExtendsClient.Options>;
    protected _aliasExtends: AliasExtendsClient_ | undefined;
    constructor(options: AliasExtendsClient.Options);
    get aliasExtends(): AliasExtendsClient_;
}
