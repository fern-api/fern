using global::System.Threading.Tasks;
using SeedSystem;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new global::SeedSystem.SeedSystemClient(
            clientOptions: new global::SeedSystem.ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreateUserAsync(
            new global::SeedSystem.User{
                Id = "id",
                Name = "name",
                Email = "email",
                Password = "password"
            }
        );
    }

}
