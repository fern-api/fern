using SeedApi;

namespace Usage;

public class Example5
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.SearchresourcesAsync(
            new ServiceSearchResourcesRequest {
                Limit = 1,
                Offset = 1,
                Query = "query",
                Filters = new Dictionary<string, object?>(){
                    ["filters"] = new Dictionary<string, object>()
                    {
                        ["key"] = "value",
                    }
                    ,
                }

            }
        );
    }

}
