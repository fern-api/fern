using SeedApi;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.ListresourcesAsync(
            new ServiceListResourcesRequest {
                Page = 1,
                PerPage = 1,
                Sort = "sort",
                Order = "order",
                IncludeTotals = true,
                Fields = "fields",
                Search = "search"
            }
        );
    }

}
