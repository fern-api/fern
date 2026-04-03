using SeedNullableOptional;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NullableOptional.SearchUsersAsync(
            new SearchUsersRequest {
                Query = "query",
                Department = "department",
                Role = "role",
                IsActive = true
            }
        );
    }

}
