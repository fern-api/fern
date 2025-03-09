using global::System.Threading.Tasks;
using SeedPlainText;
using SeedPlainText.Core;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedPlainTextClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetTextAsync();
    }

}
