using global::System.Threading.Tasks;
using SeedPathParameters;

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
            "tenant_id",
            "user_id",
            new UpdateUserRequest{
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
