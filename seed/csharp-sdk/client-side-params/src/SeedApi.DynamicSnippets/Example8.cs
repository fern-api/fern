using SeedApi;

namespace Usage;

public class Example8
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.CreateuserAsync(
            new CreateUserRequest {
                Email = "email",
                Connection = "connection"
            }
        );
    }

}
