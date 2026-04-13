namespace SeedApi;

public partial interface IInlineUsersInlineUsersClient
{
    WithRawResponseTask<InlineUsersListUsersPaginationResponse> InlineUsersInlineUsersListWithCursorPaginationAsync(
        InlineUsersInlineUsersListWithCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<InlineUsersListUsersMixedTypePaginationResponse> InlineUsersInlineUsersListWithMixedTypeCursorPaginationAsync(
        InlineUsersInlineUsersListWithMixedTypeCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<InlineUsersListUsersPaginationResponse> InlineUsersInlineUsersListWithBodyCursorPaginationAsync(
        InlineUsersInlineUsersListWithBodyCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<InlineUsersListUsersPaginationResponse> InlineUsersInlineUsersListWithOffsetPaginationAsync(
        InlineUsersInlineUsersListWithOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<InlineUsersListUsersPaginationResponse> InlineUsersInlineUsersListWithDoubleOffsetPaginationAsync(
        InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<InlineUsersListUsersPaginationResponse> InlineUsersInlineUsersListWithBodyOffsetPaginationAsync(
        InlineUsersInlineUsersListWithBodyOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<InlineUsersListUsersPaginationResponse> InlineUsersInlineUsersListWithOffsetStepPaginationAsync(
        InlineUsersInlineUsersListWithOffsetStepPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<InlineUsersListUsersPaginationResponse> InlineUsersInlineUsersListWithOffsetPaginationHasNextPageAsync(
        InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<InlineUsersListUsersExtendedResponse> InlineUsersInlineUsersListWithExtendedResultsAsync(
        InlineUsersInlineUsersListWithExtendedResultsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<InlineUsersListUsersExtendedOptionalListResponse> InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataAsync(
        InlineUsersInlineUsersListWithExtendedResultsAndOptionalDataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<UsernameCursor> InlineUsersInlineUsersListUsernamesAsync(
        InlineUsersInlineUsersListUsernamesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<InlineUsersUsernameContainer> InlineUsersInlineUsersListWithGlobalConfigAsync(
        InlineUsersInlineUsersListWithGlobalConfigRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
