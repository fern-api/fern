using SeedApi;

public partial class Examples
{
    public async Task Example16() {
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
