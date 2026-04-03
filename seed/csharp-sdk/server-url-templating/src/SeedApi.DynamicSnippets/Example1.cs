using SeedApi;

public partial class Examples
{
    public static async Task Example1()
    {
        var client = new SeedApiClient();

        await client.GetUsersAsync();
    }

}
