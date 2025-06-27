using global::System.Threading.Tasks;
using SeedPathParameters;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Organizations.GetOrganizationUserAsync(
            "tenant_id",
            "organization_id",
            "user_id",
            new GetOrganizationUserRequest()
        );
    }

}
