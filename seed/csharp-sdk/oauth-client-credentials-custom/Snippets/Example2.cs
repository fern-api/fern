using SeedOauthClientCredentials;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedOauthClientCredentialsClient(
            clientId: "<clientId>",
            clientSecret: "<clientSecret>",
            entityId: "<entity_id>",
            audience: "<audience>",
            grantType: "<grant_type>",
            scope: "<scope>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NestedNoAuth.Api.GetSomethingAsync();
    }

}
