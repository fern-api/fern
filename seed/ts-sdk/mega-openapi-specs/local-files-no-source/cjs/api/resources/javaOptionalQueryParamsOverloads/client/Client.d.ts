import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { JavaOptionalQueryParamsOverloadsClient as JavaOptionalQueryParamsOverloadsClient_ } from "../resources/javaOptionalQueryParamsOverloads/client/Client.js";
export declare namespace JavaOptionalQueryParamsOverloadsClient {
    type Options = BaseClientOptions;
}
export declare class JavaOptionalQueryParamsOverloadsClient {
    protected readonly _options: NormalizedClientOptions<JavaOptionalQueryParamsOverloadsClient.Options>;
    protected _javaOptionalQueryParamsOverloads: JavaOptionalQueryParamsOverloadsClient_ | undefined;
    constructor(options: JavaOptionalQueryParamsOverloadsClient.Options);
    get javaOptionalQueryParamsOverloads(): JavaOptionalQueryParamsOverloadsClient_;
}
