using SeedApi;

public partial class Examples
{
    public async Task Example1() {
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
