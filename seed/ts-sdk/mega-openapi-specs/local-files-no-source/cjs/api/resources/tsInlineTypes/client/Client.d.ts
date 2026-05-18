import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { TsInlineTypesClient as TsInlineTypesClient_ } from "../resources/tsInlineTypes/client/Client.js";
export declare namespace TsInlineTypesClient {
    type Options = BaseClientOptions;
}
export declare class TsInlineTypesClient {
    protected readonly _options: NormalizedClientOptions<TsInlineTypesClient.Options>;
    protected _tsInlineTypes: TsInlineTypesClient_ | undefined;
    constructor(options: TsInlineTypesClient.Options);
    get tsInlineTypes(): TsInlineTypesClient_;
}
