using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedNullableClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullable.GetusersAsync(
            new NullableGetUsersRequest()
        );
    }

}
