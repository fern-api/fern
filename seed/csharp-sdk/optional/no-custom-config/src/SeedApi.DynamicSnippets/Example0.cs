using global::System.Threading.Tasks;
using SeedObjectsWithImports;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedObjectsWithImportsClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Optional.SendOptionalBodyAsync(
            new Dictionary<string, object>(){
                ["string"] = new Dictionary<string, object>() {
                    ["key"] = "value",
                },
            }
        );
    }

}
