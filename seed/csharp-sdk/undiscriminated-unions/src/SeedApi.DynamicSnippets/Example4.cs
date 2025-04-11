using global::System.Threading.Tasks;
using SeedUndiscriminatedUnions;

namespace Usage;

public class Example4
{
    public async global::System.Threading.Tasks.Task Do() {
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
