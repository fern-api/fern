using SeedApi;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Complex.SearchAsync(
            new SearchRequest {
                Index = "index",
                Pagination = new StartingAfterPaging {
                    PerPage = 1,
                    StartingAfter = "starting_after"
                },
                Query = new SingleFilterSearchRequest {
                    Field = "field",
                    Operator = SingleFilterSearchRequestOperator.EqualTo,
                    Value = "value"
                }
            }
        );
    }

}
