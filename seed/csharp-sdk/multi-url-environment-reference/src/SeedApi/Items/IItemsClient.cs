namespace SeedApi;

public partial interface IItemsClient
{
    WithRawResponseTask<string> ListItemsAsync(
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
