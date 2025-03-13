using global::System.Threading.Tasks;
using SeedPathParameters;
using SeedPathParameters.Core;

namespace Usage;

public class Example5
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.UpdateUserAsync(
            new UpdateUserRequest{
                TenantId = "tenant_id",
                UserId = "user_id",
                Body = new User{
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
