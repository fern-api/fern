using SeedTrace;

public partial class Examples
{
    public async Task Example27() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Submission.GetExecutionSessionsStateAsync();
    }

}
