import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { GoOptionalLiteralAliasClient as GoOptionalLiteralAliasClient_ } from "../resources/goOptionalLiteralAlias/client/Client.mjs";
export declare namespace GoOptionalLiteralAliasClient {
    type Options = BaseClientOptions;
}
export declare class GoOptionalLiteralAliasClient {
    protected readonly _options: NormalizedClientOptions<GoOptionalLiteralAliasClient.Options>;
    protected _goOptionalLiteralAlias: GoOptionalLiteralAliasClient_ | undefined;
    constructor(options: GoOptionalLiteralAliasClient.Options);
    get goOptionalLiteralAlias(): GoOptionalLiteralAliasClient_;
}
