namespace SeedApi;

public partial interface IUsersClient
{
    WithRawResponseTask<ListUsersUriPaginationResponse> ListwithuripaginationAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<ListUsersPathPaginationResponse> ListwithpathpaginationAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
