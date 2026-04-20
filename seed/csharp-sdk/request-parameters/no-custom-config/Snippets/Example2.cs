using SeedRequestParameters;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedRequestParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.CreateUsernameOptionalAsync(
            new CreateUsernameBodyOptionalProperties()
        );
    }

}
