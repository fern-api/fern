using SeedApi;

public partial class Examples
{
    public async Task Example32() {
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
