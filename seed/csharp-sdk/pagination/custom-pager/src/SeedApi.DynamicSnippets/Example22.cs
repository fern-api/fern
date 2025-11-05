using SeedPagination;

namespace Usage;

public class Example22
{
    public async Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListWithExtendedResultsAndOptionalDataAsync(
            new SeedPagination.ListUsersExtendedRequestForOptionalData {
                Cursor = "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
            }
        );
    }

}
