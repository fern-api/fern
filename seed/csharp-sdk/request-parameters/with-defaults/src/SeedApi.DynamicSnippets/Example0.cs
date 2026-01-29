using SeedRequestParameters;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedRequestParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.CreateUsernameAsync(
            new CreateUsernameRequest {
                Tags = new List<string>(){
                    "tags",
                    "tags",
                }
                ,
                Username = "username",
                Password = "password",
                Name = "test"
            }
        );
    }

}
