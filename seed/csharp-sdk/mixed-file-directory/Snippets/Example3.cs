using SeedMixedFileDirectory;
using SeedMixedFileDirectory.User_.Events;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedMixedFileDirectoryClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.Events.Metadata.GetMetadataAsync(
            new GetEventMetadataRequest {
                Id = "id"
            }
        );
    }

}
