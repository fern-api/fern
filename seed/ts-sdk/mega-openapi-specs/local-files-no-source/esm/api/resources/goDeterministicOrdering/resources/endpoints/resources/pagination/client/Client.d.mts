import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../../../BaseClient.mjs";
import * as core from "../../../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../../../index.mjs";
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
     * @param {SeedApi.goDeterministicOrdering.endpoints.ListItemsPaginationRequest} request
     * @param {PaginationClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.goDeterministicOrdering.endpoints.pagination.listItems()
     */
    listItems(request?: SeedApi.goDeterministicOrdering.endpoints.ListItemsPaginationRequest, requestOptions?: PaginationClient.RequestOptions): core.HttpResponsePromise<SeedApi.goDeterministicOrdering.EndpointsPaginatedResponse>;
    private __listItems;
}
