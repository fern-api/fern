using SeedApi;

namespace Usage;

public class Example19
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.StreamXFernStreamingSharedSchemaStreamAsync(
            new StreamXFernStreamingSharedSchemaStreamRequest {
                Prompt = "prompt",
                Model = "model",
                Stream = true
            }
        ))
        {
            /* consume each item */
        }
        ;
    }

}
