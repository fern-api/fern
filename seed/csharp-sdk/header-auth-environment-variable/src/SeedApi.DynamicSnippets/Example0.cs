using SeedHeaderTokenEnvironmentVariable;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedHeaderTokenEnvironmentVariableClient(
            headerTokenAuth: "<value>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetWithBearerTokenAsync();
    }

}
