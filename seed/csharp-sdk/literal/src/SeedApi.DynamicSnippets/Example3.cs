using global::System.Threading.Tasks;
using SeedLiteral;
using SeedLiteral.Core;

namespace Usage;

public class Example3
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedLiteralClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Inlined.SendAsync(
            new SendLiteralsInlinedRequest{
                Query = "query",
                Temperature = 1.1,
                ObjectWithLiteral = new ATopLevelLiteral{
                    NestedLiteral = new ANestedLiteral()
                }
            }
        );
    }

}
