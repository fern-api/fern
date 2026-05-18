import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { CsharpInlineTypesClient as CsharpInlineTypesClient_ } from "../resources/csharpInlineTypes/client/Client.js";
export declare namespace CsharpInlineTypesClient {
    type Options = BaseClientOptions;
}
export declare class CsharpInlineTypesClient {
    protected readonly _options: NormalizedClientOptions<CsharpInlineTypesClient.Options>;
    protected _csharpInlineTypes: CsharpInlineTypesClient_ | undefined;
    constructor(options: CsharpInlineTypesClient.Options);
    get csharpInlineTypes(): CsharpInlineTypesClient_;
}
