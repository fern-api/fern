using SeedTrace;

namespace Usage;

public class Example25
{
    public async Task Do() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Submission.GetExecutionSessionAsync(
            "sessionId"
        );
    }

}
