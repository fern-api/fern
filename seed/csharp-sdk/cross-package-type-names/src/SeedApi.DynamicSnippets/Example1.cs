using global::System.Threading.Tasks;
using SeedCrossPackageTypeNames;
using SeedCrossPackageTypeNames.Core;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedCrossPackageTypeNamesClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.FolderA.Service.GetDirectThreadAsync();
    }

}
