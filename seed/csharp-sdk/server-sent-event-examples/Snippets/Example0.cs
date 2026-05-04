using SeedServerSentEvents;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedServerSentEventsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.Completions.StreamAsync(
            new StreamCompletionRequest {
                Query = "foo"
            }
        ))
        {
            /* consume each item */
        }
        ;
    }

}
