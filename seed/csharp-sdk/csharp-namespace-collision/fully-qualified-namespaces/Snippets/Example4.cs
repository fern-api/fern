using SeedCsharpNamespaceCollision;

public partial class Examples
{
    public async System.Threading.Tasks.Task Example4() {
        var client = new SeedCsharpNamespaceCollisionClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.ScimConfiguration.ListUsersAsync();
    }

}
