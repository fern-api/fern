using global::System.Threading.Tasks;
using SeedClientSideParams;

namespace Usage;

public class Example2
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedClientSideParamsClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.SearchResourcesAsync(
            new SearchResourcesRequest{
                Limit = 1,
                Offset = 1,
                Query = "query",
                Filters = new Dictionary<string, object>(){
                    ["filters"] = new Dictionary<string, object>() {
                        ["key"] = "value",
                    },
                }
            }
        );
    }

}
