using Seed.CsharpNamespaceConflict;

public partial class Examples
{
    public async System.Threading.Tasks.Task Example0() {
        var client = new Seed.CsharpNamespaceConflict.Seed(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Tasktest.HelloAsync();
    }

}
