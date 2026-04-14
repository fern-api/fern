using SeedApi;

public partial class Examples
{
    public async Task Example7() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.StreamNoContextAsync(
            new StreamRequest {
                Query = "query"
            }
        ))
        {
            /* consume each item */
        }
        ;
    }

}
