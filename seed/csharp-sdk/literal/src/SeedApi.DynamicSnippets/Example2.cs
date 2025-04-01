using global::System.Threading.Tasks;
using SeedLiteral;

namespace Usage;

public class Example2
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedLiteralClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Inlined.SendAsync(
            new SendLiteralsInlinedRequest{
                Temperature = 10.1,
                ObjectWithLiteral = new ATopLevelLiteral{
                    NestedLiteral = new ANestedLiteral()
                },
                Query = "What is the weather today"
            }
        );
    }

}
