using global::System.Threading.Tasks;
using SeedPathParameters;
using SeedPathParameters.Core;

namespace Usage;

public class Example4
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.CreateUserAsync(
            "tenant_id",
            new User{
                Name = "name",
                Tags = new List<string>(){
                    "tags",
                    "tags",
                }
            }
        );
    }

}
