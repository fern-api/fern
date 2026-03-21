using SeedBearerTokenEnvironmentVariable;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedBearerTokenEnvironmentVariableClient(
            clientOptions: new ClientOptions {
                ApiKey = "<token>",
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetWithBearerTokenAsync();
    }

}
