using SeedOauthClientCredentialsMandatoryAuth;

namespace Usage;

public class Example4
{
    public async Task Do() {
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
