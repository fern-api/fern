namespace SeedApi;

public partial interface IUsersClient
{
    WithRawResponseTask<ListUsersPaginationResponse> ListwithcursorpaginationAsync(
        UsersListWithCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ListUsersMixedTypePaginationResponse> ListwithmixedtypecursorpaginationAsync(
        UsersListWithMixedTypeCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ListUsersPaginationResponse> ListwithbodycursorpaginationAsync(
        UsersListWithBodyCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Pagination endpoint with a top-level cursor field in the request body.
    /// This tests that the mock server correctly ignores cursor mismatches
    /// when getNextPage() is called with a different cursor value.
    /// </summary>
    WithRawResponseTask<ListUsersTopLevelCursorPaginationResponse> ListwithtoplevelbodycursorpaginationAsync(
        UsersListWithTopLevelBodyCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ListUsersPaginationResponse> ListwithoffsetpaginationAsync(
        UsersListWithOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ListUsersPaginationResponse> ListwithdoubleoffsetpaginationAsync(
        UsersListWithDoubleOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ListUsersPaginationResponse> ListwithbodyoffsetpaginationAsync(
        UsersListWithBodyOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ListUsersPaginationResponse> ListwithoffsetsteppaginationAsync(
        UsersListWithOffsetStepPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ListUsersPaginationResponse> ListwithoffsetpaginationhasnextpageAsync(
        UsersListWithOffsetPaginationHasNextPageRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ListUsersExtendedResponse> ListwithextendedresultsAsync(
        UsersListWithExtendedResultsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ListUsersExtendedOptionalListResponse> ListwithextendedresultsandoptionaldataAsync(
        UsersListWithExtendedResultsAndOptionalDataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<UsernameCursor> ListusernamesAsync(
        UsersListUsernamesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<UsernameCursor> ListusernameswithoptionalresponseAsync(
        UsersListUsernamesWithOptionalResponseRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<UsernameContainer> ListwithglobalconfigAsync(
        UsersListWithGlobalConfigRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ListUsersOptionalDataPaginationResponse> ListwithoptionaldataAsync(
        UsersListWithOptionalDataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ListUsersAliasedDataPaginationResponse> ListwithaliaseddataAsync(
        UsersListWithAliasedDataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
