using SeedApi;

namespace Usage;

public class Example24
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullableoptional.GetsearchresultsAsync(
            new NullableOptionalGetSearchResultsRequest {
                Query = "query"
            }
        );
    }

}
