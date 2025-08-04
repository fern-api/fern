using global::System.Threading.Tasks;
using SeedSimpleApi;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedSimpleApiClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetAsync(
            "id"
        );
    }

}
