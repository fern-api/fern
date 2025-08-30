using global::System.Threading.Tasks;
using SeedCsharpSystemCollision;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedCsharpSystemCollision.System(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreateTaskAsync(
            new SeedCsharpSystemCollision.Task{
                Name = "name",
                User = new User{
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
