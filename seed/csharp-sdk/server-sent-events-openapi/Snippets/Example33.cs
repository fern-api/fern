using SeedApi;

public partial class Examples
{
    public async Task Example33() {
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
