using SeedApi;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullableoptional.UpdateuserAsync(
            new UpdateUserRequest {
                UserId = "userId"
            }
        );
    }

}
