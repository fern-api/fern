using SeedMultiLineDocs;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedMultiLineDocsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.CreateUserAsync(
            new CreateUserRequest {
                Name = "name",
                Age = 1
            }
        );
    }

}
