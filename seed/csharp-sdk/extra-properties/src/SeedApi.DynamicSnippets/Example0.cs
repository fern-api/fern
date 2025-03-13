using global::System.Threading.Tasks;
using SeedExtraProperties;
using SeedExtraProperties.Core;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedExtraPropertiesClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.CreateUserAsync(
            new CreateUserRequest{
                Name = "name"
            }
        );
    }

}
