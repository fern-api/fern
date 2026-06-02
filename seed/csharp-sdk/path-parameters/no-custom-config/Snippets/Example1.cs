using SeedPathParameters;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Organizations.GetOrganizationUserAsync(
            new GetOrganizationUserRequest {
                OrganizationId = "organization_id",
                UserId = "user_id",
                TenantId = "tenant_id"
            }
        );
    }

}
