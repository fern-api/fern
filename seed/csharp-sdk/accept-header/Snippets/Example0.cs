using SeedAccept;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedAcceptClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.EndpointAsync();
    }

}
