using global::System.Threading.Tasks;
using SeedApi;
using SeedApi.Core;

namespace Usage;

public class Example9
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Dataservice.FetchAsync(
            new FetchRequest{
                Ids = new List<string>(){
                    "ids",
                },
                Namespace = "namespace"
            }
        );
    }

}
