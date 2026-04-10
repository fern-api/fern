using SeedNullableOptional;

namespace Usage;

public class Example9
{
    public async Task Do() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NullableOptional.FilterByRoleAsync(
            new FilterByRoleRequest {
                Role = UserRole.Admin,
                Status = UserStatus.Active,
                SecondaryRole = UserRole.Admin
            }
        );
    }

}
