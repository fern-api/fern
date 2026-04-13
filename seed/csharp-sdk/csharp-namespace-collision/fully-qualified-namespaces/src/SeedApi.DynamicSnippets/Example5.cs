using SeedApi;

namespace Usage;

public class Example5
{
    public async System.Threading.Tasks.Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Scimconfiguration.GetconfigurationAsync();
    }

}
