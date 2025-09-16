using SeedPagination;
using System.Threading.Tasks;

namespace Usage;

public class Example3
{
    public async Task Do() {
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
