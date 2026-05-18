import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace JavaOptionalNullableQueryParamsClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class JavaOptionalNullableQueryParamsClient {
    protected readonly _options: NormalizedClientOptions<JavaOptionalNullableQueryParamsClient.Options>;
    constructor(options: JavaOptionalNullableQueryParamsClient.Options);
    /**
     * Search endpoint with optional nullable query params with defaults
     *
     * @param {SeedApi.javaOptionalNullableQueryParams.SearchRequest} request
     * @param {JavaOptionalNullableQueryParamsClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.javaOptionalNullableQueryParams.javaOptionalNullableQueryParams.search()
     */
    search(request?: SeedApi.javaOptionalNullableQueryParams.SearchRequest, requestOptions?: JavaOptionalNullableQueryParamsClient.RequestOptions): core.HttpResponsePromise<SeedApi.javaOptionalNullableQueryParams.SearchResponse>;
    private __search;
}
