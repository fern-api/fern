namespace SeedApi;

public partial interface ISeedApiClient
{
    Task<SearchResponse> SearchAsync(
        SearchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
