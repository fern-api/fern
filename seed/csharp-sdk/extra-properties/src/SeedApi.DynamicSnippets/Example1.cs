using SeedExtraProperties;

namespace Usage;

public class Example1
{
    public async Task Do() {
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
