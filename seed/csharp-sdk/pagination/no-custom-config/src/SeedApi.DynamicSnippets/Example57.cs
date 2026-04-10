using SeedApi;

namespace Usage;

public class Example57
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListwithaliaseddataAsync(
            new UsersListWithAliasedDataRequest {
                Page = 1,
                PerPage = 1,
                StartingAfter = "starting_after"
            }
        );
    }

}
