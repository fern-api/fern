using SeedApi;

public partial class Examples
{
    public async Task Example31() {
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
