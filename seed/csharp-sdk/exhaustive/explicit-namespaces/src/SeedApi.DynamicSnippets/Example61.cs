using SeedApi;
using SeedApi.Endpoints.Pagination;

namespace Usage;

public class Example61
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Pagination.ListItemsAsync(
            new ListItemsPaginationRequest()
        );
    }

}
