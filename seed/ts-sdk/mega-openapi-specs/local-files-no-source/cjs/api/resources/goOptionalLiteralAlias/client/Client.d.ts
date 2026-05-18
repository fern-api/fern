import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { GoOptionalLiteralAliasClient as GoOptionalLiteralAliasClient_ } from "../resources/goOptionalLiteralAlias/client/Client.js";
export declare namespace GoOptionalLiteralAliasClient {
    type Options = BaseClientOptions;
}
export declare class GoOptionalLiteralAliasClient {
    protected readonly _options: NormalizedClientOptions<GoOptionalLiteralAliasClient.Options>;
    protected _goOptionalLiteralAlias: GoOptionalLiteralAliasClient_ | undefined;
    constructor(options: GoOptionalLiteralAliasClient.Options);
    get goOptionalLiteralAlias(): GoOptionalLiteralAliasClient_;
}
