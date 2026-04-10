using SeedApi;

namespace Usage;

public class Example32
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.StreamXFernStreamingNullableConditionAsync(
            new StreamXFernStreamingNullableConditionRequest {
                Query = "query",
                Stream = false
            }
        );
    }

}
