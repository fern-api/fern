using SeedApi;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Organizations.GetorganizationuserAsync(
            new OrganizationsGetOrganizationUserRequest {
                TenantId = "tenant_id",
                OrganizationId = "organization_id",
                UserId = "user_id"
            }
        );
    }

}
