using SeedStreaming;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedStreamingClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Dummy.GenerateAsync(
            new Generateequest {
                Stream = false,
                NumEvents = 1
            }
        );
    }

}
