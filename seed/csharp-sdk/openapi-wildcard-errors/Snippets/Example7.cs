using SeedApi;

public partial class Examples
{
    public async Task Example7() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Items.GetItemAsync(
            new GetItemRequest {
                ItemId = "item_id"
            }
        );
    }

}
