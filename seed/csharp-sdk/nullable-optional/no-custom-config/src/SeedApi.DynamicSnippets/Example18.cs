using SeedApi;

namespace Usage;

public class Example18
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullableoptional.FilterbyroleAsync(
            new NullableOptionalFilterByRoleRequest {
                Role = UserRole.Admin
            }
        );
    }

}
