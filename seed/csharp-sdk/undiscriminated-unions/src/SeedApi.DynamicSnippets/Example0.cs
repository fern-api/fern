using global::System.Threading.Tasks;
using SeedUndiscriminatedUnions;
using SeedUndiscriminatedUnions.Core;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedUndiscriminatedUnionsClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.GetAsync(
            "string"
        );
    }

}
