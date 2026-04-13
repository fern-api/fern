using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Organizations.GetorganizationAsync(
            "tenant_id",
            "organization_id",
            new OrganizationsGetOrganizationRequest()
        );
    }

}
