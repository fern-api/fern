using SeedNullable;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedNullableClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullable.DeleteUserAsync(
            new DeleteUserRequest {
                Username = "xy"
            }
        );
    }

}
