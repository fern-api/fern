namespace SeedApi;

public partial interface ICatalogClient
{
    WithRawResponseTask<CatalogImage> CreateCatalogImageAsync(
        CreateCatalogImageBody request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<CatalogImage> GetCatalogImageAsync(
        GetCatalogImageRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
