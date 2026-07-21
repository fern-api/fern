using SeedPhpGlobalHeaderEnv;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedPhpGlobalHeaderEnvClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetWithApiVersionAsync();
    }

}
