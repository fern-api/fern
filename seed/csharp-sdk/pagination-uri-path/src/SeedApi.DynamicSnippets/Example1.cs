using SeedPaginationUriPath;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedPaginationUriPathClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListWithPathPaginationAsync();
    }

}
