using SeedApi;

public partial class Examples
{
    public async Task Example6() {
        var client = new SeedEndpointSecurityAuthClient(
            token: "<token>",
            apiKey: "<X-API-Key>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetwithoauthAsync();
    }

}
