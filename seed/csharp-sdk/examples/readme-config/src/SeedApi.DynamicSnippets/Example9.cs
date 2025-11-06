using SeedExamples;

namespace Usage;

public class Example9
{
    public async Task Do() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Health.Service.CheckAsync(
            "id-3tey93i"
        );
    }

}
