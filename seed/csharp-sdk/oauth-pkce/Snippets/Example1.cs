using SeedOauthPkce;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedOauthPkceClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Oauth.AuthorizeAsync(
            new AuthorizeRequest {
                ResponseType = "code",
                ClientId = "client_id",
                RedirectUri = "redirect_uri",
                CodeChallenge = "code_challenge",
                CodeChallengeMethod = "S256",
                Scope = "scope",
                State = "state"
            }
        );
    }

}
