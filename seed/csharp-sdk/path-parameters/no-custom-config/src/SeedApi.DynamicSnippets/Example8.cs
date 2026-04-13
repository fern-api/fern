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
            new UserUpdateUserRequest {
                TenantId = "tenant_id",
                UserId = "user_id",
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
