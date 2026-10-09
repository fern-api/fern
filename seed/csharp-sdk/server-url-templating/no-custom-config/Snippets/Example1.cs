using SeedApi;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedApiClient();

        await client.GetUsersAsync();
    }

}
