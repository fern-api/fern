using SeedApi;

public partial class Examples
{
    public async Task Example34() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.StreamXFernStreamingSseOnlyAsync(
            new StreamRequest()
        ))
        {
            /* consume each item */
        }
        ;
    }

}
