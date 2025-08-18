using global::System.Threading.Tasks;
using SeedExhaustive;

namespace Usage;

public class Example52
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExhaustive.SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new SeedExhaustive.ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NoAuth.PostWithNoAuthAsync(
            new Dictionary<string, object>() {
                ["key"] = "value",
            }
        );
    }

}
