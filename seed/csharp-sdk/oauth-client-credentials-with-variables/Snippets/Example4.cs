using SeedOauthClientCredentialsWithVariables;

public partial class Examples
{
    public async Task Example4() {
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
