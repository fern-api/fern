using SeedCsharpNamespaceCollision;

namespace Usage;

public class Example4
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedCsharpNamespaceCollisionClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.System.GetUserAsync(
            "userId"
        );
    }

}
