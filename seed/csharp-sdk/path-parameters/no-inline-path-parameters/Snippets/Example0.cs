using SeedPathParameters;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Organizations.GetOrganizationAsync(
            "tenant_id",
            "organization_id"
        );
    }

}
