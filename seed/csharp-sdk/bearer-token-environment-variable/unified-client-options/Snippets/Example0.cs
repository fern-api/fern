using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedBearerTokenEnvironmentVariableClient(
            clientOptions: new ClientOptions {
                Token = "<token>",
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.GetwithbearertokenAsync();
    }

}
