using SeedApi;

public partial class Examples
{
    public async Task Example33() {
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
