using SeedApi;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedApiClient();

        await client.GetUsersAsync();
    }

}
