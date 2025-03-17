using global::System.Threading.Tasks;
using SeedPathParameters;

namespace Usage;

public class Example6
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.SearchUsersAsync(
            "tenant_id",
            "user_id",
            new SearchUsersRequest{
                Limit = 1
            }
        );
    }

}
