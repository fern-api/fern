using SeedPathParameters;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Organizations.SearchOrganizationsAsync(
            "tenant_id",
            "organization_id",
            new SearchOrganizationsRequest {
                Limit = 1
            }
        );
    }

}
