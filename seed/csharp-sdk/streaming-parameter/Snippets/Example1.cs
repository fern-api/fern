using SeedStreaming;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedStreamingClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.Dummy.GenerateAsync(
            new GenerateRequest {
                Stream = true,
                NumEvents = 1
            }
        ))
        {
            /* consume each item */
        }
        ;
    }

}
