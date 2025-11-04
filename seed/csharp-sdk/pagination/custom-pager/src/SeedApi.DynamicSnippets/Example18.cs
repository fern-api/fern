using SeedPagination;

namespace Usage;

public class Example18
{
    public async Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListWithBodyOffsetPaginationAsync(
            new SeedPagination.ListUsersBodyOffsetPaginationRequest {
                Pagination = new SeedPagination.WithPage {
                    Page = 1
                }
            }
        );
    }

}
