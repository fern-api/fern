using SeedApi;

public partial class Examples
{
    public async Task Example18() {
        var client = new SeedErrorsClient(
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
