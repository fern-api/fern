using SeedApi;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedClientSideParamsClient(
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
