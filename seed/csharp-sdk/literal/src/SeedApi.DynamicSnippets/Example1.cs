using global::System.Threading.Tasks;
using SeedLiteral;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedLiteralClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Headers.SendAsync(
            new SendLiteralsInHeadersRequest{
                EndpointVersion = "02-12-2024",
                Async = true,
                Query = "query"
            }
        );
    }

}
