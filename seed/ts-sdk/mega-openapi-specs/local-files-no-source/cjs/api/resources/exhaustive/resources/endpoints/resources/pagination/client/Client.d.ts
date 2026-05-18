import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../../../BaseClient.js";
import * as core from "../../../../../../../../core/index.js";
import type * as SeedApi from "../../../../../../../index.js";
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
     * @param {SeedApi.exhaustive.endpoints.ListItemsPaginationRequest} request
     * @param {PaginationClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.exhaustive.endpoints.pagination.listItems()
     */
    listItems(request?: SeedApi.exhaustive.endpoints.ListItemsPaginationRequest, requestOptions?: PaginationClient.RequestOptions): core.HttpResponsePromise<SeedApi.exhaustive.EndpointsPaginatedResponse>;
    private __listItems;
}
