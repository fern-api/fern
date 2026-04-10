using SeedApi;

namespace Usage;

public class Example26
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
