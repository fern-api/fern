namespace SeedPaginationUriPath;

public partial interface IUsersClient
{
    WithRawResponseTask<ListUsersUriPaginationResponse> ListWithUriPaginationAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ListUsersPathPaginationResponse> ListWithPathPaginationAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
