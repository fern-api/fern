import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../index.mjs";
export declare namespace ComplexClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class ComplexClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<ComplexClient.Options>;
    constructor(options: ComplexClient.Options);
    /**
     * @param {SeedApi.pagination.SearchRequest} request
     * @param {ComplexClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.complex.search({
     *         index: "index",
     *         query: {}
     *     })
     */
    search(request: SeedApi.pagination.SearchRequest, requestOptions?: ComplexClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.PaginatedConversationResponse>;
    private __search;
}
