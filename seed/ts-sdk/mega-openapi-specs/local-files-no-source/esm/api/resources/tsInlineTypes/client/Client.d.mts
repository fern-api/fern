import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { TsInlineTypesClient as TsInlineTypesClient_ } from "../resources/tsInlineTypes/client/Client.mjs";
export declare namespace TsInlineTypesClient {
    type Options = BaseClientOptions;
}
export declare class TsInlineTypesClient {
    protected readonly _options: NormalizedClientOptions<TsInlineTypesClient.Options>;
    protected _tsInlineTypes: TsInlineTypesClient_ | undefined;
    constructor(options: TsInlineTypesClient.Options);
    get tsInlineTypes(): TsInlineTypesClient_;
}
