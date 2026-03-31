using SeedApi;

namespace Usage;

public class Example4
{
    public async Task Do() {
        var client = new SeedApiClient();

        await client.GetTokenAsync(
            new TokenRequest {
                ClientId = "client_id",
                ClientSecret = "client_secret"
            }
        );
    }

}
