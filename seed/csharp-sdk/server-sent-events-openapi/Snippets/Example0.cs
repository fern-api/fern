using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.StreamProtocolNoCollisionAsync(
            new StreamRequest()
        ))
        {
            /* consume each item */
        }
        ;
    }

}
