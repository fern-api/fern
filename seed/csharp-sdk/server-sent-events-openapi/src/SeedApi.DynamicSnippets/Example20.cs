using SeedApi;

namespace Usage;

public class Example20
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.StreamXFernStreamingSharedSchemaAsync(
            new StreamXFernStreamingSharedSchemaRequest {
                Prompt = "prompt",
                Model = "model",
                Stream = false
            }
        );
    }

}
