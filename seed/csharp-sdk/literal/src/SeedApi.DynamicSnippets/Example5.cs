using global::System.Threading.Tasks;
using SeedLiteral;

namespace Usage;

public class Example5
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedLiteralClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Path.SendAsync(
            "123"
        );
    }

}
