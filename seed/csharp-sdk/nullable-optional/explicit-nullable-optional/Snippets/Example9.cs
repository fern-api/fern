using SeedApi;

public partial class Examples
{
    public async Task Example9() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullableoptional.SearchusersAsync(
            new NullableOptionalSearchUsersRequest {
                Query = "query",
                Department = "department",
                Role = "role",
                IsActive = true
            }
        );
    }

}
