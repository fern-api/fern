using SeedOauthClientCredentialsMandatoryAuth;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedOauthClientCredentialsMandatoryAuthClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nested.Api.GetSomethingAsync();
    }

}
