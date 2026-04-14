using SeedMixedFileDirectory;

public partial class Examples
{
    public async Task Example0() {
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
