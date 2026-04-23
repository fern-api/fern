using SeedPagination;

public partial class Examples
{
    public async Task Example20() {
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
