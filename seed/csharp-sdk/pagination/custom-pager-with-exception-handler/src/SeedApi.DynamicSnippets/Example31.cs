using SeedApi;

namespace Usage;

public class Example31
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListwithbodycursorpaginationAsync(
            new UsersListWithBodyCursorPaginationRequest {
                Pagination = new WithCursor {
                    Cursor = "cursor"
                }
            }
        );
    }

}
