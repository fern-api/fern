using SeedCsharpNamespaceCollision;

public partial class Examples
{
    public async System.Threading.Tasks.Task Example1() {
        var client = new SeedCsharpNamespaceCollisionClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreateTaskAsync(
            new SeedCsharpNamespaceCollision.Task {
                Id = "id",
                Name = "name",
                Email = "email",
                Password = "password"
            }
        );
    }

}
