using SeedOauthPkce;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedOauthPkceClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Oauth.AuthorizeAsync(
            new AuthorizeRequest {
                ResponseType = "code",
                ClientId = "client_abc123",
                RedirectUri = "https://example.com/callback",
                CodeChallenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
                CodeChallengeMethod = "S256",
                Scope = "read write",
                State = "xyz"
            }
        );
    }

}
