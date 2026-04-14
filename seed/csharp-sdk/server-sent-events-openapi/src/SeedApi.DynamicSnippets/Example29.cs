using SeedApi;

namespace Usage;

public class Example29
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.ValidateUnionRequestAsync(
            new UnionStreamRequestBase {
                StreamResponse = true,
                Prompt = "prompt"
            }
        );
    }

}
