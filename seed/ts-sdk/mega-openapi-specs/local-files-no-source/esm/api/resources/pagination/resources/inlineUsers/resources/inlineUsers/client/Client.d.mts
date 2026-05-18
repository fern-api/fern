import type { BaseClientOptions, BaseRequestOptions } from "../../../../../../../../BaseClient.mjs";
import { type NormalizedClientOptions } from "../../../../../../../../BaseClient.mjs";
import * as core from "../../../../../../../../core/index.mjs";
import type * as SeedApi from "../../../../../../../index.mjs";
export declare namespace InlineUsersClient {
    type Options = BaseClientOptions;
    interface RequestOptions extends BaseRequestOptions {
    }
}
export declare class InlineUsersClient {
    protected readonly _options: NormalizedClientOptions<InlineUsersClient.Options>;
    constructor(options: InlineUsersClient.Options);
    /**
     * @param {SeedApi.pagination.inlineUsers.ListWithCursorPaginationInlineUsersRequest} request
     * @param {InlineUsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.inlineUsers.inlineUsers.listWithCursorPagination()
     */
    listWithCursorPagination(request?: SeedApi.pagination.inlineUsers.ListWithCursorPaginationInlineUsersRequest, requestOptions?: InlineUsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.InlineUsersListUsersPaginationResponse>;
    private __listWithCursorPagination;
    /**
     * @param {SeedApi.pagination.inlineUsers.ListWithMixedTypeCursorPaginationInlineUsersRequest} request
     * @param {InlineUsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.inlineUsers.inlineUsers.listWithMixedTypeCursorPagination()
     */
    listWithMixedTypeCursorPagination(request?: SeedApi.pagination.inlineUsers.ListWithMixedTypeCursorPaginationInlineUsersRequest, requestOptions?: InlineUsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.InlineUsersListUsersMixedTypePaginationResponse>;
    private __listWithMixedTypeCursorPagination;
    /**
     * @param {SeedApi.pagination.inlineUsers.ListWithBodyCursorPaginationInlineUsersRequest} request
     * @param {InlineUsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.inlineUsers.inlineUsers.listWithBodyCursorPagination()
     */
    listWithBodyCursorPagination(request?: SeedApi.pagination.inlineUsers.ListWithBodyCursorPaginationInlineUsersRequest, requestOptions?: InlineUsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.InlineUsersListUsersPaginationResponse>;
    private __listWithBodyCursorPagination;
    /**
     * @param {SeedApi.pagination.inlineUsers.ListWithOffsetPaginationInlineUsersRequest} request
     * @param {InlineUsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.inlineUsers.inlineUsers.listWithOffsetPagination()
     */
    listWithOffsetPagination(request?: SeedApi.pagination.inlineUsers.ListWithOffsetPaginationInlineUsersRequest, requestOptions?: InlineUsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.InlineUsersListUsersPaginationResponse>;
    private __listWithOffsetPagination;
    /**
     * @param {SeedApi.pagination.inlineUsers.ListWithDoubleOffsetPaginationInlineUsersRequest} request
     * @param {InlineUsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.inlineUsers.inlineUsers.listWithDoubleOffsetPagination()
     */
    listWithDoubleOffsetPagination(request?: SeedApi.pagination.inlineUsers.ListWithDoubleOffsetPaginationInlineUsersRequest, requestOptions?: InlineUsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.InlineUsersListUsersPaginationResponse>;
    private __listWithDoubleOffsetPagination;
    /**
     * @param {SeedApi.pagination.inlineUsers.ListWithBodyOffsetPaginationInlineUsersRequest} request
     * @param {InlineUsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.inlineUsers.inlineUsers.listWithBodyOffsetPagination()
     */
    listWithBodyOffsetPagination(request?: SeedApi.pagination.inlineUsers.ListWithBodyOffsetPaginationInlineUsersRequest, requestOptions?: InlineUsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.InlineUsersListUsersPaginationResponse>;
    private __listWithBodyOffsetPagination;
    /**
     * @param {SeedApi.pagination.inlineUsers.ListWithOffsetStepPaginationInlineUsersRequest} request
     * @param {InlineUsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.inlineUsers.inlineUsers.listWithOffsetStepPagination()
     */
    listWithOffsetStepPagination(request?: SeedApi.pagination.inlineUsers.ListWithOffsetStepPaginationInlineUsersRequest, requestOptions?: InlineUsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.InlineUsersListUsersPaginationResponse>;
    private __listWithOffsetStepPagination;
    /**
     * @param {SeedApi.pagination.inlineUsers.ListWithOffsetPaginationHasNextPageInlineUsersRequest} request
     * @param {InlineUsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.inlineUsers.inlineUsers.listWithOffsetPaginationHasNextPage()
     */
    listWithOffsetPaginationHasNextPage(request?: SeedApi.pagination.inlineUsers.ListWithOffsetPaginationHasNextPageInlineUsersRequest, requestOptions?: InlineUsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.InlineUsersListUsersPaginationResponse>;
    private __listWithOffsetPaginationHasNextPage;
    /**
     * @param {SeedApi.pagination.inlineUsers.ListWithExtendedResultsInlineUsersRequest} request
     * @param {InlineUsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.inlineUsers.inlineUsers.listWithExtendedResults()
     */
    listWithExtendedResults(request?: SeedApi.pagination.inlineUsers.ListWithExtendedResultsInlineUsersRequest, requestOptions?: InlineUsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.InlineUsersListUsersExtendedResponse>;
    private __listWithExtendedResults;
    /**
     * @param {SeedApi.pagination.inlineUsers.ListWithExtendedResultsAndOptionalDataInlineUsersRequest} request
     * @param {InlineUsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.inlineUsers.inlineUsers.listWithExtendedResultsAndOptionalData()
     */
    listWithExtendedResultsAndOptionalData(request?: SeedApi.pagination.inlineUsers.ListWithExtendedResultsAndOptionalDataInlineUsersRequest, requestOptions?: InlineUsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.InlineUsersListUsersExtendedOptionalListResponse>;
    private __listWithExtendedResultsAndOptionalData;
    /**
     * @param {SeedApi.pagination.inlineUsers.ListUsernamesInlineUsersRequest} request
     * @param {InlineUsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.inlineUsers.inlineUsers.listUsernames()
     */
    listUsernames(request?: SeedApi.pagination.inlineUsers.ListUsernamesInlineUsersRequest, requestOptions?: InlineUsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.UsernameCursor>;
    private __listUsernames;
    /**
     * @param {SeedApi.pagination.inlineUsers.ListWithGlobalConfigInlineUsersRequest} request
     * @param {InlineUsersClient.RequestOptions} requestOptions - Request-specific configuration.
     *
     * @example
     *     await client.pagination.inlineUsers.inlineUsers.listWithGlobalConfig()
     */
    listWithGlobalConfig(request?: SeedApi.pagination.inlineUsers.ListWithGlobalConfigInlineUsersRequest, requestOptions?: InlineUsersClient.RequestOptions): core.HttpResponsePromise<SeedApi.pagination.InlineUsersUsernameContainer>;
    private __listWithGlobalConfig;
}
