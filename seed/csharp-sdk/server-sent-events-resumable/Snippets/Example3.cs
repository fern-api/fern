using SeedServerSentEventsResumable;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedServerSentEventsResumableClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.Completions.StreamNonResumableAsync(
            new StreamCompletionRequestNonResumable {
                Query = "query"
            }
        ))
        {
            /* consume each item */
        }
        ;
    }

}
