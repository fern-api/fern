import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedExhaustive from "../../../../../index.js";
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
     * @param {SeedExhaustive.endpoints.ListItemsRequest} request
     * @param {PaginationClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpoints.pagination.listItems({
     *         cursor: "cursor",
     *         limit: 1
     *     })
     */
    listItems(request?: SeedExhaustive.endpoints.ListItemsRequest, requestOptions?: PaginationClient.RequestOptions): Promise<core.Page<SeedExhaustive.types.ObjectWithRequiredField, SeedExhaustive.endpoints.PaginatedResponse>>;
}
