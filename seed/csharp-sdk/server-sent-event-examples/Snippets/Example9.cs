using SeedServerSentEvents;

public partial class Examples
{
    public async Task Example9() {
        var client = new SeedServerSentEventsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.Completions.StreamEventsDiscriminantInDataAsync(
            new StreamEventsDiscriminantInDataRequest {
                Query = "query"
            }
        ))
        {
            /* consume each item */
        }
        ;
    }

}
