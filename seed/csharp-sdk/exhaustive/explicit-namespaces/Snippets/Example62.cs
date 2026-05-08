using SeedApi;
using SeedApi.Endpoints.Pagination;

public partial class Examples
{
    public async Task Example62() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Pagination.ListItemsAsync(
            new ListItemsPaginationRequest {
                Cursor = "cursor",
                Limit = 1
            }
        );
    }

}
