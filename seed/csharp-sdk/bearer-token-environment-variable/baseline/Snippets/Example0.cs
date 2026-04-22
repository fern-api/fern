using SeedBearerTokenEnvironmentVariable;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedBearerTokenEnvironmentVariableClient(
            apiKey: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetWithBearerTokenAsync();
    }

}
