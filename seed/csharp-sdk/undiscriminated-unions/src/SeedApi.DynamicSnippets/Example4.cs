using SeedUndiscriminatedUnions;
using System.Threading.Tasks;

namespace Usage;

public class Example4
{
    public async Task Do() {
        var client = new SeedUndiscriminatedUnionsClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.CallAsync(
            new Request{
                Union = new Dictionary<string, object>(){
                    ["union"] = new Dictionary<string, object>() {
                        ["key"] = "value",
                    },
                }
            }
        );
    }

}
