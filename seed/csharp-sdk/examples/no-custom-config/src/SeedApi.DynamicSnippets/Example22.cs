using SeedExamples;

namespace Usage;

public class Example22
{
    public async Task Do() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.RefreshTokenAsync(
            new RefreshTokenRequest {
                Ttl = 1
            }
        );
    }

}
