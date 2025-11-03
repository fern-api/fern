using SeedMixedFileDirectory;
using SeedMixedFileDirectory.User_.Events;

namespace Usage;

public class Example3
{
    public async Task Do() {
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
