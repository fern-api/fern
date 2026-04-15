using SeedServerSentEvents;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedServerSentEventsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.Completions.StreamWithoutTerminatorAsync(
            new StreamCompletionRequestWithoutTerminator {
                Query = "query"
            }
        ))
        {
            /* consume each item */
        }
        ;
    }

}
