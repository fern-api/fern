using SeedServerSentEvents;

public partial class Examples
{
    public static async Task Example7()
    {
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
