using Contoso.Net;

namespace Usage;

public class Example4
{
    public async System.Threading.Tasks.Task Do() {
        var client = new ContosoClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.ScimConfiguration.ListUsersAsync();
    }

}
