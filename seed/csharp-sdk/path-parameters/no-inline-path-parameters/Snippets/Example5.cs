using SeedApi;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Organizations.SearchorganizationsAsync(
            "tenant_id",
            "organization_id",
            new OrganizationsSearchOrganizationsRequest {
                Limit = 1
            }
        );
    }

}
