using global::System.Threading.Tasks;
using SeedCsharpNamespaceCollision;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new global::SeedCsharpNamespaceCollision.SeedCsharpNamespaceCollisionClient(
            clientOptions: new global::SeedCsharpNamespaceCollision.ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreateUserAsync(
            new global::SeedCsharpNamespaceCollision.User{
                Id = "id",
                Name = "name",
                Email = "email",
                Password = "password"
            }
        );
    }

}
