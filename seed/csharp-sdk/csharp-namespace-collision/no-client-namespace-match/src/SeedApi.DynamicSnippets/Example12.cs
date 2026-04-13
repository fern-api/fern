using Contoso.Net;

namespace Usage;

public class Example12
{
    public async System.Threading.Tasks.Task Do() {
        var client = new ContosoClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.System.CreatetaskAsync(
            new SystemTask {
                Name = "name",
                User = new SystemUser {
                    Line1 = "line1",
                    City = "city",
                    State = "state",
                    Zip = "zip",
                    Country = SystemUserCountry.Usa
                },
                Owner = new SystemUser {
                    Line1 = "line1",
                    City = "city",
                    State = "state",
                    Zip = "zip",
                    Country = SystemUserCountry.Usa
                }
            }
        );
    }

}
