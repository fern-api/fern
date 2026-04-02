using Contoso.Net;

namespace Usage;

public class Example0
{
    public async System.Threading.Tasks.Task Do() {
        var client = new Contoso.Net.Contoso(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreateUserAsync(
            new Contoso.Net.User {
                Id = "id",
                Name = "name",
                Email = "email",
                Password = "password"
            }
        );
    }

}
