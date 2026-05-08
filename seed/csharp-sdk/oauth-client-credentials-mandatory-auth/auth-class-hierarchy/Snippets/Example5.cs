using SeedOauthClientCredentialsMandatoryAuth;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedOauthClientCredentialsMandatoryAuthClient(
            auth: new Auth.ClientCredentials("<clientId>", "<clientSecret>"),
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Simple.GetSomethingAsync();
    }

}
