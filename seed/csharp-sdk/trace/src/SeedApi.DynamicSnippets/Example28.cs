using SeedTrace;

namespace Usage;

public class Example28
{
    public async Task Do() {
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
