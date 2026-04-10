using SeedApi;

namespace Usage;

public class Example25
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullableoptional.GetsearchresultsAsync(
            new NullableOptionalGetSearchResultsRequest {
                Query = "query",
                Filters = new Dictionary<string, string?>(){
                    ["filters"] = "filters",
                }
                ,
                IncludeTypes = new List<string>(){
                    "includeTypes",
                    "includeTypes",
                }

            }
        );
    }

}
