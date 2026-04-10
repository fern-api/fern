using SeedExamples;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreateTypeAsync(
            BasicType.Primitive
        );
    }

}
