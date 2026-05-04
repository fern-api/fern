using SeedMultiLineDocs;

public partial class Examples
{
    public async Task Example1() {
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
