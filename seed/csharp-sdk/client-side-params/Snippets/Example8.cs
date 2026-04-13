using SeedApi;

public partial class Examples
{
    public async Task Example8() {
        var client = new SeedClientSideParamsClient(
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
