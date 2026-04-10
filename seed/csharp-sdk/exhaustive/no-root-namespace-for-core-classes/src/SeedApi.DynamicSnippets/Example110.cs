using SeedApi;
using SeedApi.Core;

namespace Usage;

public class Example110
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Noauth.PostwithnoauthAsync(
            new Dictionary<string, object>()
            {
                ["key"] = "value",
            }
        );
    }

}
