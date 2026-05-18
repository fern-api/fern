import type { BaseClientOptions } from "../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../BaseClient.mjs";
import { JavaOptionalNullableQueryParamsClient as JavaOptionalNullableQueryParamsClient_ } from "../resources/javaOptionalNullableQueryParams/client/Client.mjs";
export declare namespace JavaOptionalNullableQueryParamsClient {
    type Options = BaseClientOptions;
}
export declare class JavaOptionalNullableQueryParamsClient {
    protected readonly _options: NormalizedClientOptions<JavaOptionalNullableQueryParamsClient.Options>;
    protected _javaOptionalNullableQueryParams: JavaOptionalNullableQueryParamsClient_ | undefined;
    constructor(options: JavaOptionalNullableQueryParamsClient.Options);
    get javaOptionalNullableQueryParams(): JavaOptionalNullableQueryParamsClient_;
}
