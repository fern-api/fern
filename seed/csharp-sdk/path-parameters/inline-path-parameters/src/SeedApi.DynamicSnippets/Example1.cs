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
            new GetOrganizationUserRequest{
                TenantId = "tenant_id",
                OrganizationId = "organization_id",
                UserId = "user_id"
            }
        );
    }

}
