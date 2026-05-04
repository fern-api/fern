using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedApiClient();

        await client.GetUsersAsync();
    }

}
