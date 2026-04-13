using SeedApi;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.CreateuserAsync(
            new UserCreateUserRequest {
                Type = UserCreateUserRequestType.CreateUserRequest,
                Version = UserCreateUserRequestVersion.V1,
                Name = "name"
            }
        );
    }

}
