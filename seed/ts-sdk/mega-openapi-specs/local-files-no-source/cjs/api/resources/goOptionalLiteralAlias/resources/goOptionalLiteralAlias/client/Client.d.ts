import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace GoOptionalLiteralAliasClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class GoOptionalLiteralAliasClient {
    protected readonly _options: NormalizedClientOptions<GoOptionalLiteralAliasClient.Options>;
    constructor(options: GoOptionalLiteralAliasClient.Options);
    /**
     * @param {SeedApi.goOptionalLiteralAlias.SearchRequest} request
     * @param {GoOptionalLiteralAliasClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goOptionalLiteralAlias.goOptionalLiteralAlias.search({
     *         sortField: "DEFAULT",
     *         query: "test query"
     *     })
     */
    search(request: SeedApi.goOptionalLiteralAlias.SearchRequest, requestOptions?: GoOptionalLiteralAliasClient.RequestOptions): core.HttpResponsePromise<SeedApi.goOptionalLiteralAlias.SearchResponse>;
    private __search;
}
