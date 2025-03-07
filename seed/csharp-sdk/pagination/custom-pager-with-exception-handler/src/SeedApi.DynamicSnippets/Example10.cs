using global::System.Threading.Tasks;
using SeedPagination;
using SeedPagination.Core;

namespace Usage;

public class Example10
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListWithExtendedResultsAsync(
            new ListUsersExtendedRequest{
                Cursor = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
            }
        );
    }

}
