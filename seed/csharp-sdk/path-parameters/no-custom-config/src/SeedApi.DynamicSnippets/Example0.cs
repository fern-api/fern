using SeedPathParameters;

namespace Usage;

public class Example0
{
    public async Task Do() {
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
