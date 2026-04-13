using SeedApi;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedOauthClientCredentialsMandatoryAuthClient(
            clientOptions: new ClientOptions {
                Token = "<token>",
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NestedApi.NestedApiGetSomethingAsync();
    }

}
