using global::System.Threading.Tasks;
using SeedCsharpNamespaceConflict;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedCsharpNamespaceConflictClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Tasktest.HelloAsync();
    }

}
