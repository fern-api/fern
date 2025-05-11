using global::System.Threading.Tasks;
using SeedErrorProperty;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedErrorPropertyClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.PropertyBasedError.ThrowErrorAsync();
    }

}
