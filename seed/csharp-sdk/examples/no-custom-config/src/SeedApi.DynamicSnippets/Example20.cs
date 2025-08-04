using global::System.Threading.Tasks;
using SeedExamples;

namespace Usage;

public class Example20
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.RefreshTokenAsync(
            new RefreshTokenRequest{
                Ttl = 420
            }
        );
    }

}
