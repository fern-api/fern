using SeedPathParameters;

public partial class Examples
{
    public static async Task Example2()
    {
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
