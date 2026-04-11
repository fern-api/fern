using SeedApi;

namespace Usage;

public class Example25
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.StreamXFernStreamingUnionStreamAsync(
            new StreamXFernStreamingUnionStreamRequest(
                new UnionStreamMessageVariant {
                    Message = "message",
                    StreamResponse = true,
                    Prompt = "prompt"
                }
            ) {
                StreamResponse = true,
            }
        ))
        {
            /* consume each item */
        }
        ;
    }

}
