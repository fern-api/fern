using SeedStreaming;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedStreamingClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Dummy.GenerateAsync(
            new Generateequest {
                Stream = false,
                NumEvents = 5
            }
        );
    }

}
