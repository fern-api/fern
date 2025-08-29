using global::System.Threading.Tasks;
using SeedStreaming;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedStreamingClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Dummy.GenerateAsync(
            new Generateequest{
                Stream = false,
                NumEvents = 5
            }
        );
    }

}
