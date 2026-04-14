using SeedNullableOptional;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NullableOptional.ListUsersAsync(
            new ListUsersRequest {
                Limit = 1,
                Offset = 1,
                IncludeDeleted = true,
                SortBy = "sortBy"
            }
        );
    }

}
