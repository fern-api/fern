using SeedTrace;

namespace Usage;

public class Example32
{
    public async Task Do() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.V2.Problem.GetLatestProblemAsync(
            "problemId"
        );
    }

}
