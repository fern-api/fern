namespace SeedApi;

public partial interface ISeedApiClient
{
    WithRawResponseTask<CatalogV1Id> CreateCatalogAsync(
        CatalogV1Id request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Activity> CreateActivityAsync(
        Activity request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
