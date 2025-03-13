using global::System.Threading.Tasks;
using SeedLiteral;
using SeedLiteral.Core;

namespace Usage;

public class Example7
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedLiteralClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Query.SendAsync(
            new SendLiteralsInQueryRequest{
                Query = "query"
            }
        );
    }

}
