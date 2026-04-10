using SeedMixedFileDirectory;
using SeedMixedFileDirectory.User_;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedMixedFileDirectoryClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.Events.ListEventsAsync(
            new ListUserEventsRequest {
                Limit = 1
            }
        );
    }

}
