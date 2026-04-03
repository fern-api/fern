using SeedApi;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedApiClient();

        await client.GetTokenAsync(
            new TokenRequest {
                ClientId = "client_id",
                ClientSecret = "client_secret"
            }
        );
    }

}
