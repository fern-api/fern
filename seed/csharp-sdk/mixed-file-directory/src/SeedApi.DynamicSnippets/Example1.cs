using SeedMixedFileDirectory;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedMixedFileDirectoryClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.ListAsync(
            new ListUsersRequest {
                Limit = 1
            }
        );
    }

}
