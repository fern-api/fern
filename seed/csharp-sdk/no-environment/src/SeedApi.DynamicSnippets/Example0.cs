using SeedNoEnvironment;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedNoEnvironmentClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Dummy.GetDummyAsync();
    }

}
