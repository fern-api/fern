using SeedApi;

public partial class Examples
{
    public async Task Example14() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.StreamXFernStreamingConditionStreamAsync(
            new StreamXFernStreamingConditionStreamRequest {
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
