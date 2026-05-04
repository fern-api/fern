using SeedTrace;

public partial class Examples
{
    public async Task Example28() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Sysprop.SetNumWarmInstancesAsync(
            Language.Java,
            1
        );
    }

}
