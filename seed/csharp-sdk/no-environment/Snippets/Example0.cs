using SeedNoEnvironment;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedNoEnvironmentClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Dummy.GetDummyAsync();
    }

}
