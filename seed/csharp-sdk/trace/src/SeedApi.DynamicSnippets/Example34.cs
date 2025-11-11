using SeedTrace;

namespace Usage;

public class Example34
{
    public async Task Do() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.V2.V3.Problem.GetLightweightProblemsAsync();
    }

}
