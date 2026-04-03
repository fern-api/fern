using Contoso.Net;

public partial class Examples
{
    public async System.Threading.Tasks.Task Example0() {
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
