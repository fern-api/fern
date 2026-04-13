using SeedApi;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedEndpointSecurityAuthClient(
            token: "<token>",
            apiKey: "<X-API-Key>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetwithapikeyAsync();
    }

}
