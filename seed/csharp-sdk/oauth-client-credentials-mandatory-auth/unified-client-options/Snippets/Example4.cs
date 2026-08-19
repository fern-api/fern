using SeedOauthClientCredentialsMandatoryAuth;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedOauthClientCredentialsMandatoryAuthClient(
            clientOptions: new ClientOptions {
                ClientId = "<clientId>",
                ClientSecret = "<clientSecret>",
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nested.Api.GetSomethingAsync();
    }

}
