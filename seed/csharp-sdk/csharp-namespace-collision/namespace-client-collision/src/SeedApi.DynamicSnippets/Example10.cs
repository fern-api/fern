using Contoso.Net;

namespace Usage;

public class Example10
{
    public async System.Threading.Tasks.Task Do() {
        var client = new Contoso.Net.Contoso(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.System.CreateuserAsync(
            new SystemUser {
                Line1 = "line1",
                City = "city",
                State = "state",
                Zip = "zip",
                Country = SystemUserCountry.Usa
            }
        );
    }

}
