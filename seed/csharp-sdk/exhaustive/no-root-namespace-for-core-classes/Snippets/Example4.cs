using SeedApi;
using SeedApi.Core;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NoAuth.PostWithNoAuthAsync(
            new Dictionary<string, object>()
            {
                ["key"] = "value",
            }
        );
    }

}
