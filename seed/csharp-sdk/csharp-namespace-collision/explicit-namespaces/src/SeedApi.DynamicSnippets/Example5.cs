using Contoso.Net;

namespace Usage;

public class Example5
{
    public async System.Threading.Tasks.Task Do() {
        var client = new Contoso.Net.Contoso(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.System.CreateUserAsync(
            new Contoso.Net.System.User {
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
