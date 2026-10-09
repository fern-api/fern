using SeedCsharpGlobalHeaderLiteralEnv;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedCsharpGlobalHeaderLiteralEnvClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetWithLiteralVersionHeaderAsync();
    }

}
