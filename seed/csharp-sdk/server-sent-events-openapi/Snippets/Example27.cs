using SeedApi;

public partial class Examples
{
    public async Task Example27() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.StreamXFernStreamingUnionAsync(
            new StreamXFernStreamingUnionRequest(
                new UnionStreamMessageVariant {
                    Message = "message",
                    StreamResponse = false,
                    Prompt = "prompt"
                }
            ) {
                StreamResponse = false,
            }
        );
    }

}
