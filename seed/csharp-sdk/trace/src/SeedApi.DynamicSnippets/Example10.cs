using SeedTrace;

namespace Usage;

public class Example10
{
    public async Task Do() {
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
