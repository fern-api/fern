using SeedCsharpGlobalHeaderEnv;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedCsharpGlobalHeaderEnvClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetWithApiVersionAsync();
    }

}
