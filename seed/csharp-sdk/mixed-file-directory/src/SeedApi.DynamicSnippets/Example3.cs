using global::System.Threading.Tasks;
using SeedMixedFileDirectory;
using SeedMixedFileDirectory.User.Events;

namespace Usage;

public class Example3
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedMixedFileDirectoryClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.Events.Metadata.GetMetadataAsync(
            new GetEventMetadataRequest{
                Id = "id"
            }
        );
    }

}
