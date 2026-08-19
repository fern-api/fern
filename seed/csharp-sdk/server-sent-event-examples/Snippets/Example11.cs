using SeedServerSentEvents;

public partial class Examples
{
    public async Task Example11() {
        var client = new SeedServerSentEventsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.Completions.StreamEventsContextProtocolAsync(
            new StreamEventsContextProtocolRequest {
                Query = "query"
            }
        ))
        {
            /* consume each item */
        }
        ;
    }

}
