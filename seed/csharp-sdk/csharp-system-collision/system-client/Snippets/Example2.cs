using SeedApi;

public partial class Examples
{
    public async System.Threading.Tasks.Task Example2() {
        var client = new SeedCsharpSystemCollision.System(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client._.CreateTaskAsync(
            new SeedApi.Task {
                Name = "name",
                User = new User {
                    Line1 = "line1",
                    City = "city",
                    State = "state",
                    Zip = "zip",
                    Country = UserCountry.Usa
                }
            }
        );
    }

}
