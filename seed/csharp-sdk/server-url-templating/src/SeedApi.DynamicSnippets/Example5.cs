using SeedApi;

namespace Usage;

public class Example5
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
