using SeedServerSentEvents;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedServerSentEventsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.Completions.StreamEventsAsync(
            new StreamEventsRequest {
                Query = ""
            }
        ))
        {
            /* consume each item */
        }
        ;
    }

}
