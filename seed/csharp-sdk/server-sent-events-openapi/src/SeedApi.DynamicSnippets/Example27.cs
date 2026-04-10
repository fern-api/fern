using SeedApi;

namespace Usage;

public class Example27
{
    public async Task Do() {
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
