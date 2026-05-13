using SeedBearerTokenEnvironmentVariable;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedBearerTokenEnvironmentVariableClient(
            auth: new Auth.Bearer {Token = "YOUR_API_KEY"},
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetWithBearerTokenAsync();
    }

}
