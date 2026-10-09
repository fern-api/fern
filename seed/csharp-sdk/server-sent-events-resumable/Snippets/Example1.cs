using SeedServerSentEventsResumable;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedServerSentEventsResumableClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.Completions.StreamAsync(
            new StreamCompletionRequest {
                Query = "query"
            }
        ))
        {
            /* consume each item */
        }
        ;
    }

}
