using SeedEndpointSecurityAuth;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedEndpointSecurityAuthClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetWithBearerAsync();
    }

}
