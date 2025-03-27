using global::System.Threading.Tasks;
using SeedServerSentEvents;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
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
