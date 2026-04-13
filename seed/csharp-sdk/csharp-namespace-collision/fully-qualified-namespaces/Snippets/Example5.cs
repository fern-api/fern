using SeedApi;

public partial class Examples
{
    public async System.Threading.Tasks.Task Example5() {
        var client = new SeedCsharpNamespaceCollisionClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Scimconfiguration.GetconfigurationAsync();
    }

}
