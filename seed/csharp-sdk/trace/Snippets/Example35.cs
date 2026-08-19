using SeedTrace;

public partial class Examples
{
    public async Task Example35() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.V2.V3.Problem.GetProblemsAsync();
    }

}
