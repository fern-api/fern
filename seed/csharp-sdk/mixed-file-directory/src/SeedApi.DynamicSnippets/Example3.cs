using System.Threading.Tasks;
using SeedMixedFileDirectory;

namespace Usage;

public class Example3
{
    public async Task Do()
    {
        var client = new SeedMixedFileDirectoryClient(
            clientOptions: new ClientOptions
            {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.Events.Metadata.GetMetadataAsync(
            new SeedMixedFileDirectory.User.Events.GetEventMetadataRequest
            {
                Id = "id"
            }
        );
    }

}
