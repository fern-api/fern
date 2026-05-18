import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../BaseClient.js";
import { type NormalizedClientOptions } from "../../../../../../BaseClient.js";
import * as core from "../../../../../../core/index.js";
import type * as SeedApi from "../../../../../index.js";
export declare namespace UsersClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class UsersClient {
    protected readonly _options: NormalizedClientOptions<UsersClient.Options>;
    constructor(options: UsersClient.Options);
    /**
     * @param {UsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.paginationUriPath.users.listWithUriPagination()
     */
    listWithUriPagination(requestOptions?: UsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.paginationUriPath.ListUsersUriPaginationResponse>;
    private __listWithUriPagination;
    /**
     * @param {UsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.paginationUriPath.users.listWithPathPagination()
     */
    listWithPathPagination(requestOptions?: UsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.paginationUriPath.ListUsersPathPaginationResponse>;
    private __listWithPathPagination;
}
