using SeedPathParameters;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.UpdateUserAsync(
            tenantId: "tenant_id",
            userId: "user_id",
            request: new UpdateUserRequest {
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
