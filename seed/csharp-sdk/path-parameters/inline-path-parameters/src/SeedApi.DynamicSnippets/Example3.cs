using global::System.Threading.Tasks;
using SeedPathParameters;

namespace Usage;

public class Example3
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetUserAsync(
            new GetUsersRequest{
                TenantId = "tenant_id",
                UserId = "user_id"
            }
        );
    }

}
