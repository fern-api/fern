using global::System.Threading.Tasks;
using SeedMixedFileDirectory;
using SeedMixedFileDirectory.Core;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedMixedFileDirectoryClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Organization.CreateAsync(
            new CreateOrganizationRequest{
                Name = "name"
            }
        );
    }

}
