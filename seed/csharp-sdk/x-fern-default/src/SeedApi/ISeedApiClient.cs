namespace SeedApi;

public partial interface ISeedApiClient
{
    WithRawResponseTask<TestGetResponse> TestGetAsync(
        TestGetRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
