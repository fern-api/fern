using SeedWebsocket;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedWebsocketClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Status.GetStatusAsync();
    }

}
