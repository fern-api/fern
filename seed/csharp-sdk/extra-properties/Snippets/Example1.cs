using SeedExtraProperties;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedExtraPropertiesClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.CreateUserAsync(
            new CreateUserRequest {
                Type = "CreateUserRequest",
                Version = "v1",
                Name = "name"
            }
        );
    }

}
