using SeedApi;

namespace Usage;

public class Example39
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListwithbodyoffsetpaginationAsync(
            new UsersListWithBodyOffsetPaginationRequest {
                Pagination = new WithPage {
                    Page = 1
                }
            }
        );
    }

}
