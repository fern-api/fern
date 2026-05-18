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
     * @param {SeedApi.pagination.ListWithCursorPaginationUsersRequest} request
     * @param {UsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.users.listWithCursorPagination()
     */
    listWithCursorPagination(request?: SeedApi.pagination.ListWithCursorPaginationUsersRequest, requestOptions?: UsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.ListUsersPaginationResponse>;
    private __listWithCursorPagination;
    /**
     * @param {SeedApi.pagination.ListWithMixedTypeCursorPaginationUsersRequest} request
     * @param {UsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.users.listWithMixedTypeCursorPagination()
     */
    listWithMixedTypeCursorPagination(request?: SeedApi.pagination.ListWithMixedTypeCursorPaginationUsersRequest, requestOptions?: UsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.ListUsersMixedTypePaginationResponse>;
    private __listWithMixedTypeCursorPagination;
    /**
     * @param {SeedApi.pagination.ListWithBodyCursorPaginationUsersRequest} request
     * @param {UsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.users.listWithBodyCursorPagination()
     */
    listWithBodyCursorPagination(request?: SeedApi.pagination.ListWithBodyCursorPaginationUsersRequest, requestOptions?: UsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.ListUsersPaginationResponse>;
    private __listWithBodyCursorPagination;
    /**
     * Pagination endpoint with a top-level cursor field in the request body.
     * This tests that the mock server correctly ignores cursor mismatches
     * when getNextPage() is called with a different cursor value.
     *
     * @param {SeedApi.pagination.ListWithTopLevelBodyCursorPaginationUsersRequest} request
     * @param {UsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.users.listWithTopLevelBodyCursorPagination({
     *         cursor: "initial_cursor",
     *         filter: "active"
     *     })
     */
    listWithTopLevelBodyCursorPagination(request?: SeedApi.pagination.ListWithTopLevelBodyCursorPaginationUsersRequest, requestOptions?: UsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.ListUsersTopLevelCursorPaginationResponse>;
    private __listWithTopLevelBodyCursorPagination;
    /**
     * @param {SeedApi.pagination.ListWithOffsetPaginationUsersRequest} request
     * @param {UsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.users.listWithOffsetPagination()
     */
    listWithOffsetPagination(request?: SeedApi.pagination.ListWithOffsetPaginationUsersRequest, requestOptions?: UsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.ListUsersPaginationResponse>;
    private __listWithOffsetPagination;
    /**
     * @param {SeedApi.pagination.ListWithDoubleOffsetPaginationUsersRequest} request
     * @param {UsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.users.listWithDoubleOffsetPagination()
     */
    listWithDoubleOffsetPagination(request?: SeedApi.pagination.ListWithDoubleOffsetPaginationUsersRequest, requestOptions?: UsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.ListUsersPaginationResponse>;
    private __listWithDoubleOffsetPagination;
    /**
     * @param {SeedApi.pagination.ListWithBodyOffsetPaginationUsersRequest} request
     * @param {UsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.users.listWithBodyOffsetPagination()
     */
    listWithBodyOffsetPagination(request?: SeedApi.pagination.ListWithBodyOffsetPaginationUsersRequest, requestOptions?: UsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.ListUsersPaginationResponse>;
    private __listWithBodyOffsetPagination;
    /**
     * @param {SeedApi.pagination.ListWithOffsetStepPaginationUsersRequest} request
     * @param {UsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.users.listWithOffsetStepPagination()
     */
    listWithOffsetStepPagination(request?: SeedApi.pagination.ListWithOffsetStepPaginationUsersRequest, requestOptions?: UsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.ListUsersPaginationResponse>;
    private __listWithOffsetStepPagination;
    /**
     * @param {SeedApi.pagination.ListWithOffsetPaginationHasNextPageUsersRequest} request
     * @param {UsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.users.listWithOffsetPaginationHasNextPage()
     */
    listWithOffsetPaginationHasNextPage(request?: SeedApi.pagination.ListWithOffsetPaginationHasNextPageUsersRequest, requestOptions?: UsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.ListUsersPaginationResponse>;
    private __listWithOffsetPaginationHasNextPage;
    /**
     * @param {SeedApi.pagination.ListWithExtendedResultsUsersRequest} request
     * @param {UsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.users.listWithExtendedResults()
     */
    listWithExtendedResults(request?: SeedApi.pagination.ListWithExtendedResultsUsersRequest, requestOptions?: UsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.ListUsersExtendedResponse>;
    private __listWithExtendedResults;
    /**
     * @param {SeedApi.pagination.ListWithExtendedResultsAndOptionalDataUsersRequest} request
     * @param {UsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.users.listWithExtendedResultsAndOptionalData()
     */
    listWithExtendedResultsAndOptionalData(request?: SeedApi.pagination.ListWithExtendedResultsAndOptionalDataUsersRequest, requestOptions?: UsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.ListUsersExtendedOptionalListResponse>;
    private __listWithExtendedResultsAndOptionalData;
    /**
     * @param {SeedApi.pagination.ListUsernamesUsersRequest} request
     * @param {UsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.users.listUsernames()
     */
    listUsernames(request?: SeedApi.pagination.ListUsernamesUsersRequest, requestOptions?: UsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.UsernameCursor>;
    private __listUsernames;
    /**
     * @param {SeedApi.pagination.ListUsernamesWithOptionalResponseUsersRequest} request
     * @param {UsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.users.listUsernamesWithOptionalResponse()
     */
    listUsernamesWithOptionalResponse(request?: SeedApi.pagination.ListUsernamesWithOptionalResponseUsersRequest, requestOptions?: UsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.UsernameCursor | null>;
    private __listUsernamesWithOptionalResponse;
    /**
     * @param {SeedApi.pagination.ListWithGlobalConfigUsersRequest} request
     * @param {UsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.users.listWithGlobalConfig()
     */
    listWithGlobalConfig(request?: SeedApi.pagination.ListWithGlobalConfigUsersRequest, requestOptions?: UsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.UsernameContainer>;
    private __listWithGlobalConfig;
    /**
     * @param {SeedApi.pagination.ListWithOptionalDataUsersRequest} request
     * @param {UsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.users.listWithOptionalData()
     */
    listWithOptionalData(request?: SeedApi.pagination.ListWithOptionalDataUsersRequest, requestOptions?: UsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.ListUsersOptionalDataPaginationResponse>;
    private __listWithOptionalData;
    /**
     * @param {SeedApi.pagination.ListWithAliasedDataUsersRequest} request
     * @param {UsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.users.listWithAliasedData()
     */
    listWithAliasedData(request?: SeedApi.pagination.ListWithAliasedDataUsersRequest, requestOptions?: UsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.ListUsersAliasedDataPaginationResponse>;
    private __listWithAliasedData;
}
