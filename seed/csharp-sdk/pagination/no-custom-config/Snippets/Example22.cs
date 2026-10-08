using SeedPagination;

public partial class Examples
{
    public async Task Example22() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Users.ListWithOffsetStepPaginationAsync(
            new SeedPagination.ListUsersOffsetStepPaginationRequest {
                Page = 1,
                Limit = 1,
                Order = SeedPagination.Order.Asc
            }
        );
    }

}
