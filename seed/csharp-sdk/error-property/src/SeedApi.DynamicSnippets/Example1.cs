using SeedErrorProperty;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedErrorPropertyClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.PropertyBasedError.ThrowErrorAsync();
    }

}
