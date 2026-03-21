using global::Seed.CsharpNamespaceConflict;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new global::Seed.CsharpNamespaceConflict.Seed(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Tasktest.HelloAsync();
    }

}
