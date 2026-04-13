using SeedApi;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullableoptional.ListusersAsync(
            new NullableOptionalListUsersRequest()
        );
    }

}
