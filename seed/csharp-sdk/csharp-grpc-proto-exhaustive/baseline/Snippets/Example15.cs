using SeedApi;

public partial class Examples
{
    public async Task Example15() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.DataService.ListAsync(
            new ListRequest {
                Prefix = "prefix",
                Limit = 1u,
                PaginationToken = "pagination_token",
                Namespace = "namespace"
            }
        );
    }

}
