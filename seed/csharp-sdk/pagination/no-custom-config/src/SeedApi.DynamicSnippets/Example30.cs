using SeedApi;

namespace Usage;

public class Example30
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListwithbodycursorpaginationAsync(
            new UsersListWithBodyCursorPaginationRequest()
        );
    }

}
