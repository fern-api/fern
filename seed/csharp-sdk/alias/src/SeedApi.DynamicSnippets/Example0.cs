using global::System.Threading.Tasks;
using SeedAlias;
using SeedAlias.Core;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedAliasClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.GetAsync(
            "typeId"
        );
    }

}
