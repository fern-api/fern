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

        await foreach (var item in client.Dummy.GenerateAsync(
            new GenerateRequest{
                Stream = true,
                NumEvents = 1
            }
        )) {/** consume each item */};
    }

}
