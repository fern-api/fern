using global::System.Threading.Tasks;
using SeedNullableOptional;

namespace Usage;

public class Example12
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NullableOptional.GetSearchResultsAsync(
            new SearchRequest{
                Query = "query",
                Filters = new Dictionary<string, string?>(){
                    ["filters"] = "filters",
                },
                IncludeTypes = new List<string>(){
                    "includeTypes",
                    "includeTypes",
                }
            }
        );
    }

}
