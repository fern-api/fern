using SeedBearerTokenEnvironmentVariable;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedBearerTokenEnvironmentVariableClient(
            clientOptions: new ClientOptions {
                ApiKey = "YOUR_API_KEY",
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetWithBearerTokenAsync();
    }

}
