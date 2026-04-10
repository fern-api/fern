import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.mjs";
import { type NormalizedClientOptionsWithAuth } from "../../../../../../BaseClient.mjs";
import * as core from "../../../../../../core/index.mjs";
import type * as SeedExhaustive from "../../../../../index.mjs";
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
