namespace SeedApi;

public partial interface ISeedApiClient
{
    WithRawResponseTask<BulkUpdateTasksResponse> BulkUpdateTasksAsync(
        BulkUpdateTasksRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
