using SeedApi;

public partial class Examples
{
    public async Task Example20() {
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
