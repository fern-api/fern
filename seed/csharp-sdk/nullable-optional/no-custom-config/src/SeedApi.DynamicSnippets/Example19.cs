using SeedApi;

namespace Usage;

public class Example19
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullableoptional.FilterbyroleAsync(
            new NullableOptionalFilterByRoleRequest {
                Role = UserRole.Admin,
                Status = UserStatus.Active,
                SecondaryRole = UserRole.Admin
            }
        );
    }

}
