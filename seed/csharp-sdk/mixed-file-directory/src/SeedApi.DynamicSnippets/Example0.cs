using SeedMixedFileDirectory;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedMixedFileDirectoryClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Organization.CreateAsync(
            new CreateOrganizationRequest {
                Name = "name"
            }
        );
    }

}
