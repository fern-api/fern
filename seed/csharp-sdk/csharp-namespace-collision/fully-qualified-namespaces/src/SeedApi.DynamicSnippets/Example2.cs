using global::System.Threading.Tasks;
using SeedCsharpNamespaceCollision;
using SeedCsharpNamespaceCollision.System;

namespace Usage;

public class Example2
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new global::SeedCsharpNamespaceCollision.SeedCsharpNamespaceCollisionClient(
            clientOptions: new global::SeedCsharpNamespaceCollision.ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.System.CreateUserAsync(
            new global::SeedCsharpNamespaceCollision.System.User{
                Line1 = "line1",
                Line2 = "line2",
                City = "city",
                State = "state",
                Zip = "zip"
            }
        );
    }

}
