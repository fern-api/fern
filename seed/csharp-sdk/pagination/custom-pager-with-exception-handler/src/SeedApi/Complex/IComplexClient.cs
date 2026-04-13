namespace SeedApi;

public partial interface IComplexClient
{
    WithRawResponseTask<PaginatedConversationResponse> SearchAsync(
        SearchRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
