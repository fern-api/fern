using global::System.Threading.Tasks;
using SeedPathParameters;

namespace Usage;

public class Example2
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Organizations.SearchOrganizationsAsync(
            "tenant_id",
            "organization_id",
            new SearchOrganizationsRequest{
                Limit = 1
            }
        );
    }

}
