using SeedCsharpNamespaceCollision;

namespace Usage;

public class Example2
{
    public async System.Threading.Tasks.Task Do() {
        var client = new SeedCsharpNamespaceCollisionClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.System.CreateUserAsync(
            new SeedCsharpNamespaceCollision.System.User {
                Line1 = "line1",
                Line2 = "line2",
                City = "city",
                State = "state",
                Zip = "zip",
                Country = "USA"
            }
        );
    }

}
