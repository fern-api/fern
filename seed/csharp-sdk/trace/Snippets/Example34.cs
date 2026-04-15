using SeedTrace;

public partial class Examples
{
    public async Task Example34() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.V2.V3.Problem.GetLightweightProblemsAsync();
    }

}
