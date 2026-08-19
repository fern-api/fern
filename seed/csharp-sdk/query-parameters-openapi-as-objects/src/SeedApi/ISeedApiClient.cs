namespace SeedApi;

public partial interface ISeedApiClient
{
    WithRawResponseTask<SearchResponse> SearchAsync(
        SearchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
