using SeedApi;

namespace Usage;

public class Example7
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.ListusersAsync(
            new ServiceListUsersRequest {
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
