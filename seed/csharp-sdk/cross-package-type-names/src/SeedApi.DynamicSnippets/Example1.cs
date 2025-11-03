using SeedCrossPackageTypeNames;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedCrossPackageTypeNamesClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.FolderD.Service.GetDirectThreadAsync();
    }

}
