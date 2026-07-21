using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedApiClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.GetTokenAsync(
            new GetTokenAuthRequest {
                Audience = GetTokenAuthRequestAudience.Pets,
                ClientId = "client_id",
                ClientSecret = "client_secret",
                Scopes = "scopes",
                GrantType = GetTokenAuthRequestGrantType.ClientCredentials,
                Tenant = "tenant",
                OptionalHint = "optional_hint"
            }
        );
    }

}
