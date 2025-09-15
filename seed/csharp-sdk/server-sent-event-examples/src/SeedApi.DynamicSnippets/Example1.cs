using SeedServerSentEvents;
using System.Threading.Tasks;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedServerSentEventsClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Completions.StreamAsync(
            new StreamCompletionRequest{
                Query = "query"
            }
        );
    }

}
