using global::System.Threading.Tasks;
using SeedNullableOptional;

namespace Usage;

public class Example4
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NullableOptional.SearchUsersAsync(
            new SearchUsersRequest{
                Query = "query",
                Department = "department",
                Role = "role",
                IsActive = true
            }
        );
    }

}
