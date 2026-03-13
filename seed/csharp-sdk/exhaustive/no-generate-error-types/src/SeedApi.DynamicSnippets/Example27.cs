using SeedExhaustive;
using SeedExhaustive.Endpoints;

namespace Usage;

public class Example27
{
    public async Task Do() {
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
