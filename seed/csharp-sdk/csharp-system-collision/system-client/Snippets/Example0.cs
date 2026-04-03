using SeedCsharpSystemCollision;

public partial class Examples
{
    public async System.Threading.Tasks.Task Example0() {
        var client = new SeedCsharpSystemCollision.System(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreateUserAsync(
            new User {
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
