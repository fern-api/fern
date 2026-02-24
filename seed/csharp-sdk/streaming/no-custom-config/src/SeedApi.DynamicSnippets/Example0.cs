using SeedStreaming;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedStreamingClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.Dummy.GenerateStreamAsync(
            new GenerateStreamRequest {
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
