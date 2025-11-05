using SeedPagination;

namespace Usage;

public class Example0
{
    public async Task Do() {
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
