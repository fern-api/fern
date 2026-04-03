using SeedNullableOptional;

public partial class Examples
{
    public async Task Example12() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NullableOptional.GetSearchResultsAsync(
            new SearchRequest {
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
