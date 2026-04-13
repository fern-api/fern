using SeedApi;

namespace Usage;

public class Example11
{
    public async System.Threading.Tasks.Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.System.CreateuserAsync(
            new SystemUser {
                Line1 = "line1",
                Line2 = "line2",
                City = "city",
                State = "state",
                Zip = "zip",
                Country = SystemUserCountry.Usa
            }
        );
    }

}
