namespace SeedApi;

public partial interface IProductsClient
{
    WithRawResponseTask<SearchProductsResponse> SearchAsync(
        SearchProductsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Product> GetAsync(
        GetProductsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
