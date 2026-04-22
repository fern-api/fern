using SeedPathParameters;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedPathParametersClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.CreateUserAsync(
            "tenant_id",
            new User {
                Name = "name",
                Tags = new List<string>(){
                    "tags",
                    "tags",
                }

            }
        );
    }

}
