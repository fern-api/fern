import type { BaseClientOptions, BaseRequestOptions } from "../../../../BaseClient.js";
import { type NormalizedClientOptionsWithAuth } from "../../../../BaseClient.js";
import * as core from "../../../../core/index.js";
import type * as SeedApi from "../../../index.js";
export declare namespace EndpointsPaginationClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class EndpointsPaginationClient {
    protected readonly _options: NormalizedClientOptionsWithAuth<EndpointsPaginationClient.Options>;
    constructor(options: EndpointsPaginationClient.Options);
    /**
     * List items with cursor pagination
     *
     * @param {SeedApi.EndpointsPaginationListItemsRequest} request
     * @param {EndpointsPaginationClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.endpointsPagination.endpointsPaginationListItems()
     */
    endpointsPaginationListItems(request?: SeedApi.EndpointsPaginationListItemsRequest, requestOptions?: EndpointsPaginationClient.RequestOptions): core.HttpResponsePromise<SeedApi.EndpointsPaginatedResponse>;
    private __endpointsPaginationListItems;
}
