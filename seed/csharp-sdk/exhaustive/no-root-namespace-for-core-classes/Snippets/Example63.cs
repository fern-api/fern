using SeedExhaustive;
using SeedExhaustive.Core;

public partial class Examples
{
    public async Task Example63() {
        var client = new SeedExhaustiveClient(
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
