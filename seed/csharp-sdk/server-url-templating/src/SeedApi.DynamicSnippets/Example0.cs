using SeedApi;

public partial class Examples
{
    public static async Task Example0()
    {
        var client = new SeedApiClient();

        await client.GetUsersAsync();
    }

}
