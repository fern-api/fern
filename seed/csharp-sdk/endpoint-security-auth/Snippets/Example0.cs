using SeedEndpointSecurityAuth;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedEndpointSecurityAuthClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GetTokenAsync(
            new GetTokenRequest {
                ClientId = "client_id",
                ClientSecret = "client_secret",
                Audience = "https://api.example.com",
                GrantType = "client_credentials"
            }
        );
    }

}
