using global::System.Threading.Tasks;
using SeedMixedFileDirectory;
using SeedMixedFileDirectory.Core;
using SeedMixedFileDirectory.User;

namespace Usage;

public class Example2
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedMixedFileDirectoryClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.Events.ListEventsAsync(
            new ListUserEventsRequest{
                Limit = 1
            }
        );
    }

}
