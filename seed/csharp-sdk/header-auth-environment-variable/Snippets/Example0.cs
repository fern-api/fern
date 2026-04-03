using SeedHeaderTokenEnvironmentVariable;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedHeaderTokenEnvironmentVariableClient(
            headerTokenAuth: "<value>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetWithBearerTokenAsync();
    }

}
