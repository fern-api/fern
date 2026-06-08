using SeedPathParameters;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Organizations.GetOrganizationUserAsync(
            "tenant_id",
            "organization_id",
            "user_id"
        );
    }

}
