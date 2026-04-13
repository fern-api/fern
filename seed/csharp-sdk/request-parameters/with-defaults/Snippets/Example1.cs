using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedRequestParametersClient(
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
