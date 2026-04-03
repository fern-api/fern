using SeedApi;

public partial class Examples
{
    public static async Task Example3()
    {
        var client = new SeedApiClient();

        await client.GetUserAsync(
            new GetUserRequest {
                UserId = "userId"
            }
        );
    }

}
