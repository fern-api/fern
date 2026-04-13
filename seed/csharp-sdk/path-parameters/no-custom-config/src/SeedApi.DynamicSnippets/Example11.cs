using SeedApi;

namespace Usage;

public class Example11
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.CreateuserAsync(
            new UserCreateUserRequest {
                TenantId = "tenant_id",
                Body = new User {
                    Name = "name",
                    Tags = new List<string>(){
                        "tags",
                        "tags",
                    }

                }
            }
        );
    }

}
