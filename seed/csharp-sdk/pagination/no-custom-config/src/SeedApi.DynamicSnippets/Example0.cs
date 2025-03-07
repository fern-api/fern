using global::System.Threading.Tasks;
using SeedPagination;
using SeedPagination.Core;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedPaginationClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Complex.SearchAsync(
            new SearchRequest{
                Pagination = new StartingAfterPaging{
                    PerPage = 1,
                    StartingAfter = "starting_after"
                },
                Query = new SingleFilterSearchRequest{
                    Field = "field",
                    Operator = SingleFilterSearchRequestOperator.Equals,
                    Value = "value"
                }
            }
        );
    }

}
