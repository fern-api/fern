using SeedApi;

namespace Usage;

public class Example11
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.FolderService.FolderServiceUnknownRequestAsync(
            new Dictionary<string, object>()
            {
                ["key"] = "value",
            }
        );
    }

}
