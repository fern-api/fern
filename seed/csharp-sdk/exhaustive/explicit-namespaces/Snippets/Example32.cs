using SeedExhaustive;
using SeedExhaustive.Endpoints.Pagination;

public partial class Examples
{
    public async Task Example32() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Pagination.ListItemsAsync(
            new ListItemsRequest {
                Cursor = "cursor",
                Limit = 1
            }
        );
    }

}
