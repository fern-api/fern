using SeedOauthClientCredentialsMandatoryAuth;

namespace Usage;

public class Example5
{
    public async Task Do() {
        var client = new SeedOauthClientCredentialsMandatoryAuthClient(
            clientOptions: new ClientOptions {
                ClientId = "<clientId>",
                ClientSecret = "<clientSecret>",
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Simple.GetSomethingAsync();
    }

}
