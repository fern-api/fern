using global::System.Threading.Tasks;
using SeedRequestParameters;

namespace Usage;

public class Example0
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedRequestParametersClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.CreateUsernameAsync(
            new CreateUsernameRequest{
                Username = "username",
                Password = "password",
                Name = "test"
            }
        );
    }

}
