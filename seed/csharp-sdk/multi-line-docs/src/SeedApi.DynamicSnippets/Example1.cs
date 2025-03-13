using global::System.Threading.Tasks;
using SeedMultiLineDocs;
using SeedMultiLineDocs.Core;

namespace Usage;

public class Example1
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedMultiLineDocsClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.CreateUserAsync(
            new CreateUserRequest{
                Name = "name",
                Age = 1
            }
        );
    }

}
