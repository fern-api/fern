using SeedApi;

public partial class Examples
{
    public async Task Example21() {
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
