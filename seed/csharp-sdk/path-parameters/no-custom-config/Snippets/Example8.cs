using SeedApi;

public partial class Examples
{
    public async Task Example8() {
        var client = new SeedPathParametersClient(
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
