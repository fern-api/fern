import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { CsharpInlineTypesClient as CsharpInlineTypesClient_ } from "../resources/csharpInlineTypes/client/Client.mjs";
export declare namespace CsharpInlineTypesClient {
    type Options = BaseClientOptions;
}
export declare class CsharpInlineTypesClient {
    protected readonly _options: NormalizedClientOptions<CsharpInlineTypesClient.Options>;
    protected _csharpInlineTypes: CsharpInlineTypesClient_ | undefined;
    constructor(options: CsharpInlineTypesClient.Options);
    get csharpInlineTypes(): CsharpInlineTypesClient_;
}
