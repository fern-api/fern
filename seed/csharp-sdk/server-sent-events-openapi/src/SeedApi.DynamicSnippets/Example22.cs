using SeedApi;

namespace Usage;

public class Example22
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.ValidateCompletionAsync(
            new SharedCompletionRequest {
                Prompt = "prompt",
                Model = "model"
            }
        );
    }

}
