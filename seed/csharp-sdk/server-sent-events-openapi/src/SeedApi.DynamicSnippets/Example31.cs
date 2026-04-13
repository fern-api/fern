using SeedApi;

namespace Usage;

public class Example31
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.StreamXFernStreamingNullableConditionStreamAsync(
            new StreamXFernStreamingNullableConditionStreamRequest {
                Query = "query",
                Stream = true
            }
        ))
        {
            /* consume each item */
        }
        ;
    }

}
