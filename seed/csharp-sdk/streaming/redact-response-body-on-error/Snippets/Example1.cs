using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedStreamingClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Dummy.GenerateAsync(
            new DummyGenerateRequest {
                Stream = true,
                NumEvents = 1
            }
        );
    }

}
