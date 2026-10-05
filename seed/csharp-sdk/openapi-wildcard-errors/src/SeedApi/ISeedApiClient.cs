namespace SeedApi;

public partial interface ISeedApiClient
{
    public IItemsClient Items { get; }
}
