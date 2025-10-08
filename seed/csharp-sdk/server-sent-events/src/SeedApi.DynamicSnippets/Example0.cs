using SeedServerSentEvents;
using System.Threading.Tasks;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedServerSentEventsClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await foreach (var item in client.Completions.StreamAsync(
            new StreamCompletionRequest{
                Query = "query"
            }
        )) {
            /* consume each item */
        };
    }

}
