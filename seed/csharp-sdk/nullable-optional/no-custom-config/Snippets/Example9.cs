using SeedNullableOptional;

public partial class Examples
{
    public async Task Example9() {
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
