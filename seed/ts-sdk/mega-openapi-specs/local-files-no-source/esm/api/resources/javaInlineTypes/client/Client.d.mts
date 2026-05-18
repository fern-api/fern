import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { JavaInlineTypesClient as JavaInlineTypesClient_ } from "../resources/javaInlineTypes/client/Client.mjs";
export declare namespace JavaInlineTypesClient {
    type Options = BaseClientOptions;
}
export declare class JavaInlineTypesClient {
    protected readonly _options: NormalizedClientOptions<JavaInlineTypesClient.Options>;
    protected _javaInlineTypes: JavaInlineTypesClient_ | undefined;
    constructor(options: JavaInlineTypesClient.Options);
    get javaInlineTypes(): JavaInlineTypesClient_;
}
