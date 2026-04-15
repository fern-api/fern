using SeedRequestParameters;

public partial class Examples
{
    public async Task Example1() {
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
