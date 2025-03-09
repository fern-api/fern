using global::System.Threading.Tasks;
using SeedPackageYml;
using SeedPackageYml.Core;

namespace Usage;

public class Example3
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedPackageYmlClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.NopAsync(
            "id",
            "nestedId"
        );
    }

}
