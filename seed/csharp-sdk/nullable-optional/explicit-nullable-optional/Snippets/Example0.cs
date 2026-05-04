using SeedNullableOptional;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NullableOptional.GetUserAsync(
            "userId"
        );
    }

}
