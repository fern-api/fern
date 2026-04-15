using SeedCsharpSystemCollision;

public partial class Examples
{
    public async System.Threading.Tasks.Task Example1() {
        var client = new SeedCsharpSystemCollision.System(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreateTaskAsync(
            new SeedCsharpSystemCollision.Task {
                Name = "name",
                User = new User {
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
