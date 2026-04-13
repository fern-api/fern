using SeedApi;

public partial class Examples
{
    public async Task Example8() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullableoptional.SearchusersAsync(
            new NullableOptionalSearchUsersRequest {
                Query = "query",
                Department = "department"
            }
        );
    }

}
