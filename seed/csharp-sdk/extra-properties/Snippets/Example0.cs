using SeedExtraProperties;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedExtraPropertiesClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.CreateUserAsync(
            new CreateUserRequest {
                Name = "Alice",
                Type = "CreateUserRequest",
                Version = "v1"
            }
        );
    }

}
