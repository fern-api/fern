using SeedApi;

namespace Usage;

public class Example28
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.ValidateUnionRequestAsync(
            new UnionStreamRequestBase {
                Prompt = "prompt"
            }
        );
    }

}
