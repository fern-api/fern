using SeedApi;

public partial class Examples
{
    public async Task Example23() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.ValidateCompletionAsync(
            new SharedCompletionRequest {
                Prompt = "prompt",
                Model = "model",
                Stream = true
            }
        );
    }

}
