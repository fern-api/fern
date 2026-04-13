using SeedApi;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedPathParametersClient(
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
