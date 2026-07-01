using SeedOauthClientCredentials;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedOauthClientCredentialsClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            entityId: "<entity_id>",
            scope: "<scope>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NestedNoAuth.Api.GetSomethingAsync();
    }

}
