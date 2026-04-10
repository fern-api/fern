using SeedOauthClientCredentialsWithVariables;

namespace Usage;

public class Example4
{
    public async Task Do() {
        var client = new SeedOauthClientCredentialsWithVariablesClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.PostAsync(
            "<endpointParam>"
        );
    }

}
