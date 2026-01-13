using SeedPagination.Core;

namespace SeedPagination;

public partial interface IUsersClient
{
    Task<Pager<User>> ListWithCursorPaginationAsync(
        ListUsersCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<Pager<User>> ListWithMixedTypeCursorPaginationAsync(
        ListUsersMixedTypeCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<Pager<User>> ListWithBodyCursorPaginationAsync(
        ListUsersBodyCursorPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<Pager<User>> ListWithOffsetPaginationAsync(
        ListUsersOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<Pager<User>> ListWithDoubleOffsetPaginationAsync(
        ListUsersDoubleOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<Pager<User>> ListWithBodyOffsetPaginationAsync(
        ListUsersBodyOffsetPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<Pager<User>> ListWithOffsetStepPaginationAsync(
        ListUsersOffsetStepPaginationRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<Pager<User>> ListWithOffsetPaginationHasNextPageAsync(
        ListWithOffsetPaginationHasNextPageRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<Pager<User>> ListWithExtendedResultsAsync(
        ListUsersExtendedRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<Pager<User>> ListWithExtendedResultsAndOptionalDataAsync(
        ListUsersExtendedRequestForOptionalData request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<Pager<string>> ListUsernamesAsync(
        ListUsernamesRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<Pager<string>> ListUsernamesWithOptionalResponseAsync(
        ListUsernamesWithOptionalResponseRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<Pager<string>> ListWithGlobalConfigAsync(
        ListWithGlobalConfigRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    Task<Pager<User>> ListWithOptionalDataAsync(
        ListUsersOptionalDataRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
