using SeedPagination;

namespace Usage;

public class Example24
{
    public async Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListWithGlobalConfigAsync(
            new SeedPagination.ListWithGlobalConfigRequest {
                Offset = 1
            }
        );
    }

}
