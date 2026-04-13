using SeedApi;

namespace Usage;

public class Example4
{
    public async System.Threading.Tasks.Task Do() {
        var client = new SeedApi.System(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client._.EmptyResponseAsync(
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
