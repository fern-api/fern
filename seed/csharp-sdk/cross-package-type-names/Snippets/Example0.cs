using SeedCrossPackageTypeNames;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedCrossPackageTypeNamesClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.FolderA.Service.GetDirectThreadAsync();
    }

}
