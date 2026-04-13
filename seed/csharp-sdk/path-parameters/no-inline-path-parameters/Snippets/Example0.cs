using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Organizations.GetorganizationAsync(
            new OrganizationsGetOrganizationRequest {
                TenantId = "tenant_id",
                OrganizationId = "organization_id"
            }
        );
    }

}
