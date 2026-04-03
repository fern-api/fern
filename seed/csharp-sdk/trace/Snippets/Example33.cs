using SeedTrace;

public partial class Examples
{
    public async Task Example33() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.V2.Problem.GetProblemVersionAsync(
            "problemId",
            1
        );
    }

}
