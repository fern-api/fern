using SeedCsharpNamespaceConflict;

public partial class Examples
{
    public async System.Threading.Tasks.Task Example0() {
        var client = new SeedCsharpNamespaceConflictClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Tasktest.HelloAsync();
    }

}
