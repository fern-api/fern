using SeedApi;

public partial class Examples
{
    public async Task Example18() {
        var client = new SeedExamplesClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.RefreshtokenAsync(
            new RefreshTokenRequest {
                Ttl = 1
            }
        );
    }

}
