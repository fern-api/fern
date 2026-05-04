using SeedTrace;

public partial class Examples
{
    public async Task Example36() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.V2.V3.Problem.GetLatestProblemAsync(
            "problemId"
        );
    }

}
