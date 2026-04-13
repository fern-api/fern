using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedClientSideParamsClient(
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
