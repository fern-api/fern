using System.Threading.Tasks;
using SeedMixedFileDirectory;

namespace Usage;

public class Example2
{
    public async Task Do()
    {
        var client = new SeedMixedFileDirectoryClient(
            clientOptions: new ClientOptions
            {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.Events.ListEventsAsync(
            new SeedMixedFileDirectory.User.ListUserEventsRequest
            {
                Limit = 1
            }
        );
    }

}
