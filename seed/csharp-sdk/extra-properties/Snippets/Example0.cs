using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedExtraPropertiesClient(
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
