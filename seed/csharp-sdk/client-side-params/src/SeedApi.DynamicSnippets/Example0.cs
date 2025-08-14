using global::System.Threading.Tasks;
using SeedClientSideParams;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedClientSideParamsClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.ListResourcesAsync(
            new ListResourcesRequest{
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
