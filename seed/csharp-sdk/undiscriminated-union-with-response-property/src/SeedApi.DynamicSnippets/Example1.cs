using SeedUndiscriminatedUnionWithResponseProperty;
using System.Threading.Tasks;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedUndiscriminatedUnionWithResponsePropertyClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.ListUnionsAsync();
    }

}
