namespace SeedApi;

public partial interface ISeedApiClient
{
    public IProductsClient Products { get; }
}
