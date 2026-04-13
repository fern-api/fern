using SeedApi;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.CreateusernamewithreferencedtypeAsync(
            new CreateUsernameBody {
                Tags = new List<string>(){
                    "tags",
                }
                ,
                Username = "username",
                Password = "password",
                Name = "name"
            }
        );
    }

}
