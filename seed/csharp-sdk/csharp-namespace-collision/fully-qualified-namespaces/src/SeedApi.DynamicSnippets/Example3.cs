using SeedCsharpNamespaceCollision;

namespace Usage;

public class Example3
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedCsharpNamespaceCollisionClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.System.CreateTaskAsync(
            new global::SeedCsharpNamespaceCollision.System.Task {
                Name = "name",
                User = new global::SeedCsharpNamespaceCollision.System.User {
                    Line1 = "line1",
                    Line2 = "line2",
                    City = "city",
                    State = "state",
                    Zip = "zip",
                    Country = "USA"
                }
            }
        );
    }

}
