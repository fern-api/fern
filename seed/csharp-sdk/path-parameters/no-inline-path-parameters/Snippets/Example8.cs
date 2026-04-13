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
