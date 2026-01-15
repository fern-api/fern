using SeedNullableOptional;

namespace Usage;

public class Example3
{
    public async Task Do() {
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
