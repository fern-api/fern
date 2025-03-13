using global::System.Threading.Tasks;
using SeedApi;
using SeedApi.Core;

namespace Usage;

public class Example11
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Dataservice.ListAsync(
            new ListRequest{
                Prefix = "prefix",
                Limit = 1u,
                PaginationToken = "paginationToken",
                Namespace = "namespace"
            }
        );
    }

}
