using SeedApi;

namespace Usage;

public class Example8
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.UpdateuserAsync(
            "tenant_id",
            "user_id",
            new UserUpdateUserRequest {
                Body = new User {
                    Name = "name",
                    Tags = new List<string>(){
                        "tags",
                    }

                }
            }
        );
    }

}
