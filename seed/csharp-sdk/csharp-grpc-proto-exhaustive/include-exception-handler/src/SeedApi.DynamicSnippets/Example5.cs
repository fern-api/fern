using global::System.Threading.Tasks;
using SeedApi;
using OneOf;

namespace Usage;

public class Example5
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Dataservice.DeleteAsync(
            new DeleteRequest{
                Ids = new List<string>(){
                    "ids",
                    "ids",
                },
                DeleteAll = true,
                Namespace = "namespace",
                Filter = new Dictionary<string, OneOf<double, string, bool>>(){
                    ["filter"] = 1.1,
                }
            }
        );
    }

}
