using SeedClientSideParams;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new SeedClientSideParamsClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.ListUsersAsync(
            new ListUsersRequest {
                Page = 1,
                PerPage = 1,
                IncludeTotals = true,
                Sort = "sort",
                Connection = "connection",
                Q = "q",
                SearchEngine = "search_engine",
                Fields = "fields"
            }
        );
    }

}
