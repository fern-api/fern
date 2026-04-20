using Contoso.Net;

public partial class Examples
{
    public async System.Threading.Tasks.Task Example1() {
        var client = new ContosoClient(
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
