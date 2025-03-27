using global::System.Threading.Tasks;
using SeedPagination;

namespace Usage;

public class Example6
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListWithMixedTypeCursorPaginationAsync(
            new ListUsersMixedTypeCursorPaginationRequest()
        );
    }

}
