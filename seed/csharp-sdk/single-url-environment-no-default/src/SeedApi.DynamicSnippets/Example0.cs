using SeedSingleUrlEnvironmentNoDefault;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedSingleUrlEnvironmentNoDefaultClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Dummy.GetDummyAsync();
    }

}
