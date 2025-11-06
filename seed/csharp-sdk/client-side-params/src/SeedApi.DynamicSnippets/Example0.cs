using SeedClientSideParams;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedClientSideParamsClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.ListResourcesAsync(
            new ListResourcesRequest {
                Page = 1,
                PerPage = 1,
                Sort = "created_at",
                Order = "desc",
                IncludeTotals = true,
                Fields = "fields",
                Search = "search"
            }
        );
    }

}
