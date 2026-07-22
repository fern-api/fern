using SeedApi;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedApiClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Auth.RefreshTokenAsync(
            new RefreshTokenAuthRequest {
                RefreshToken = "refresh_token",
                GrantType = RefreshTokenAuthRequestGrantType.RefreshToken
            }
        );
    }

}
