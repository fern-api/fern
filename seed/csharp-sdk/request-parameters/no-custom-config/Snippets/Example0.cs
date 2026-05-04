using SeedRequestParameters;

public partial class Examples
{
    public async Task Example0() {
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
