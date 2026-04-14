using SeedTrace;

public partial class Examples
{
    public async Task Example10() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Homepage.SetHomepageProblemsAsync(
            new List<string>(){
                "string",
                "string",
            }
        );
    }

}
