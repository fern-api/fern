using SeedStreaming;

public partial class Examples
{
    public async Task Example2() {
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
