using SeedSingleUrlEnvironmentNoDefault;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedSingleUrlEnvironmentNoDefaultClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            },
            token: "<token>"
        );

        await client.Dummy.GetDummyAsync();
    }

}
