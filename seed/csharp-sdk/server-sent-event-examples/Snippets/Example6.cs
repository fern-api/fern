using SeedServerSentEvents;

public partial class Examples
{
    public async Task Example6() {
        var client = new SeedServerSentEventsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.Completions.StreamEventsAsync(
            new StreamEventsRequest {
                Query = "query"
            }
        ))
        {
            /* consume each item */
        }
        ;
    }

}
