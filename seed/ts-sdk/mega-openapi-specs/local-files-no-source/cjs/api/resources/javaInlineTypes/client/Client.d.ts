import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { JavaInlineTypesClient as JavaInlineTypesClient_ } from "../resources/javaInlineTypes/client/Client.js";
export declare namespace JavaInlineTypesClient {
    type Options = BaseClientOptions;
}
export declare class JavaInlineTypesClient {
    protected readonly _options: NormalizedClientOptions<JavaInlineTypesClient.Options>;
    protected _javaInlineTypes: JavaInlineTypesClient_ | undefined;
    constructor(options: JavaInlineTypesClient.Options);
    get javaInlineTypes(): JavaInlineTypesClient_;
}
