using SeedApi;

public partial class Examples
{
    public async Task Example6() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullableoptional.CreateuserAsync(
            new CreateUserRequest {
                Username = "username"
            }
        );
    }

}
