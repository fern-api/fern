using SeedApi;

public partial class Examples
{
    public async Task Example24() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.StreamXFernStreamingUnionStreamAsync(
            new StreamXFernStreamingUnionStreamRequest(
                new UnionStreamMessageVariant {
                    Prompt = "prompt",
                    Message = "message",
                    StreamResponse = true
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
