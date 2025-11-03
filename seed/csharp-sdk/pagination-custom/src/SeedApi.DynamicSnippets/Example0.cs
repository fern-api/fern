using SeedPagination;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListUsernamesCustomAsync(
            new ListUsernamesRequestCustom {
                StartingAfter = "starting_after"
            }
        );
    }

}
