using SeedRequestParameters;

namespace Usage;

public class Example3
{
    public async Task Do() {
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
