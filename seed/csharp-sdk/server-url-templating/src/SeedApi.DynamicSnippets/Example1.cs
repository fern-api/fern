using SeedApi;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedApiClient();

        await client.GetUsersAsync();
    }

}
