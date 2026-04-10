using SeedApi;

namespace Usage;

public class Example16
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.StreamXFernStreamingConditionAsync(
            new StreamXFernStreamingConditionRequest {
                Query = "query",
                Stream = false
            }
        );
    }

}
