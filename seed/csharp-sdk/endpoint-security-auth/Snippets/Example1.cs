using SeedEndpointSecurityAuth;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedEndpointSecurityAuthClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetWithBearerAsync();
    }

}
