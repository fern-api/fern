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
            new SearchUsersRequest{
                TenantId = "tenant_id",
                UserId = "user_id",
                Limit = 1
            }
        );
    }

}
