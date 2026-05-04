using SeedRequestParameters;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedRequestParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.CreateUsernameOptionalAsync(
            new CreateUsernameBodyOptionalProperties {
                Username = "username",
                Password = "password",
                Name = "test"
            }
        );
    }

}
