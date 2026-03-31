using SeedRequestParameters;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedRequestParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.CreateUsernameWithReferencedTypeAsync(
            new CreateUsernameReferencedRequest {
                Tags = new List<string>(){
                    "tags",
                    "tags",
                }
                ,
                Body = new CreateUsernameBody {
                    Username = "username",
                    Password = "password",
                    Name = "test"
                }
            }
        );
    }

}
