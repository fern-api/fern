namespace SeedApi;

public partial interface IItemsClient
{
    WithRawResponseTask<Item> CreateItemAsync(
        CreateItemRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );

    WithRawResponseTask<Item> GetItemAsync(
        GetItemRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
