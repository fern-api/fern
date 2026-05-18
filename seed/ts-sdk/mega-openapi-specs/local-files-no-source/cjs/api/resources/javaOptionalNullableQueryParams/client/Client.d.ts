import type { BaseClientOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../BaseClient.js";
import { JavaOptionalNullableQueryParamsClient as JavaOptionalNullableQueryParamsClient_ } from "../resources/javaOptionalNullableQueryParams/client/Client.js";
export declare namespace JavaOptionalNullableQueryParamsClient {
    type Options = BaseClientOptions;
}
export declare class JavaOptionalNullableQueryParamsClient {
    protected readonly _options: NormalizedClientOptions<JavaOptionalNullableQueryParamsClient.Options>;
    protected _javaOptionalNullableQueryParams: JavaOptionalNullableQueryParamsClient_ | undefined;
    constructor(options: JavaOptionalNullableQueryParamsClient.Options);
    get javaOptionalNullableQueryParams(): JavaOptionalNullableQueryParamsClient_;
}
