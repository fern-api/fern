using SeedCsharpNamespaceCollision;

public partial class Examples
{
    public async System.Threading.Tasks.Task Example0() {
        var client = new SeedCsharpNamespaceCollisionClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreateUserAsync(
            new SeedCsharpNamespaceCollision.User {
                Id = "id",
                Name = "name",
                Email = "email",
                Password = "password"
            }
        );
    }

}
