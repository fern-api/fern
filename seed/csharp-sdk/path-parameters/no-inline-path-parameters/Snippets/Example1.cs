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
            tenantId: "tenant_id",
            organizationId: "organization_id",
            userId: "user_id",
            request: new GetOrganizationUserRequest()
        );
    }

}
