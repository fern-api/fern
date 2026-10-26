using SeedApi;

public partial class Examples
{
    public async Task Example26() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.StreamXFernStreamingUnionStreamAsync(
            new StreamXFernStreamingUnionStreamRequest(
                new UnionStreamMessageVariant {
                    StreamResponse = true,
                    Prompt = "prompt",
                    Message = "message"
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
