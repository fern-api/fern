using Contoso.Net;

namespace Usage;

public class Example2
{
    public async System.Threading.Tasks.Task Do() {
        var client = new ContosoClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client._.CreateTaskAsync(
            new Contoso.Net.Task {
                Id = "id",
                Name = "name",
                Email = "email",
                Password = "password"
            }
        );
    }

}
