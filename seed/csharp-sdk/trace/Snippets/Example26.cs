using SeedTrace;

public partial class Examples
{
    public async Task Example26() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Submission.StopExecutionSessionAsync(
            "sessionId"
        );
    }

}
