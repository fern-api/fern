using SeedMixedFileDirectory;
using SeedMixedFileDirectory.User_;

public partial class Examples
{
    public async Task Example2() {
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
