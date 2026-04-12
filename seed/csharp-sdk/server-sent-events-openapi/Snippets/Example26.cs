using SeedApi;

public partial class Examples
{
    public async Task Example26() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.StreamXFernStreamingUnionAsync(
            new StreamXFernStreamingUnionRequest(
                new UnionStreamMessageVariant {
                    Prompt = "prompt",
                    Message = "message",
                    StreamResponse = false
                }
            ) {
                StreamResponse = false,
            }
        );
    }

}
