using Contoso.Net;

namespace Usage;

public class Example1
{
    public async System.Threading.Tasks.Task Do() {
        var client = new ContosoClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client._.CreateUserAsync(
            new User {
                Id = "id",
                Name = "name",
                Email = "email",
                Password = "password"
            }
        );
    }

}
