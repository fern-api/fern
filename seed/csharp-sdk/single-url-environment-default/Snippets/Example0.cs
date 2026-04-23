using SeedSingleUrlEnvironmentDefault;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedSingleUrlEnvironmentDefaultClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Dummy.GetDummyAsync();
    }

}
