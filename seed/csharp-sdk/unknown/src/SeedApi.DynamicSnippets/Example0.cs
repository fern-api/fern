using global::System.Threading.Tasks;
using SeedUnknownAsAny;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedUnknownAsAnyClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Unknown.PostAsync(
            new Dictionary<string, object>() {
                ["key"] = "value",
            }
        );
    }

}
