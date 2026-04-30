using SeedPagination;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Complex.SearchAsync(
            "index",
            new SearchRequest {
                Pagination = new StartingAfterPaging {
                    PerPage = 1,
                    StartingAfter = "starting_after"
                },
                Query = new SingleFilterSearchRequest {
                    Field = "field",
                    Operator = SingleFilterSearchRequestOperator.Equals_,
                    Value = "value"
                }
            }
        );
    }

}
