import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace PaginationClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class PaginationClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<PaginationClient.Options>;
    constructor(options: PaginationClient.Options);
    /**
     * List items with cursor pagination
     *
     * @param {SeedApi.endpoints.ListItemsPaginationRequest} request
     * @param {PaginationClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.pagination.listItems()
     */
    listItems(request?: SeedApi.endpoints.ListItemsPaginationRequest, requestOptions?: PaginationClient.RequestOptions): core.HttpResponsePromise<SeedApi.EndpointsPaginatedResponse>;
    private __listItems;
}
