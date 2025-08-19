using global::System.Threading.Tasks;
using SeedExhaustive;

namespace Usage;

public class Example46
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Urls.WithMixedCaseAsync();
    }

}
