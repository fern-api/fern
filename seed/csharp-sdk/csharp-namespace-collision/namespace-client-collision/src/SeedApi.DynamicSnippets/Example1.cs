using Contoso.Net;

namespace Usage;

public class Example1
{
    public async System.Threading.Tasks.Task Do() {
        var client = new Contoso.Net.Contoso(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreateTaskAsync(
            new Contoso.Net.Task {
                Id = "id",
                Name = "name",
                Email = "email",
                Password = "password"
            }
        );
    }

}
