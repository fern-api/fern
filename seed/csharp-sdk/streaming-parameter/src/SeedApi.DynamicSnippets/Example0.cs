using global::System.Threading.Tasks;
using SeedStreaming;
using SeedStreaming.Core;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedStreamingClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Dummy.GenerateAsync(
            new GenerateRequest{
                Stream = false,
                NumEvents = 5
            }
        );
    }

}
