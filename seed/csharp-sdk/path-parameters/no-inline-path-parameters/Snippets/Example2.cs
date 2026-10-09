using SeedPathParameters;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Organizations.SearchOrganizationsAsync(
            tenantId: "tenant_id",
            organizationId: "organization_id",
            request: new SearchOrganizationsRequest {
                Limit = 1
            }
        );
    }

}
