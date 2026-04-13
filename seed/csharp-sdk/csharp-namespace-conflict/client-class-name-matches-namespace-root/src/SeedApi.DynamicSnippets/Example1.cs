using Seed.CsharpNamespaceConflict;

namespace Usage;

public class Example1
{
    public async System.Threading.Tasks.Task Do() {
        var client = new Seed.CsharpNamespaceConflict.Seed(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Tasktest.HelloAsync();
    }

}
