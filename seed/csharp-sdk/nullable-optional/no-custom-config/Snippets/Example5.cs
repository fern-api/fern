using SeedApi;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullableoptional.ListusersAsync(
            new NullableOptionalListUsersRequest {
                Limit = 1,
                Offset = 1,
                IncludeDeleted = true,
                SortBy = "sortBy"
            }
        );
    }

}
