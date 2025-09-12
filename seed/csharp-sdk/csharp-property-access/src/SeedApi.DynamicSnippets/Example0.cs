using global::System.Threading.Tasks;
using SeedCsharpAccess;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedCsharpAccessClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreateUserAsync(
            new User{
                Id = "id",
                Name = "name",
                Email = "email",
                Password = "password"
            }
        );
    }

}
