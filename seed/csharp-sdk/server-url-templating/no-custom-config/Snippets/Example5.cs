using SeedApi;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedApiClient();

        await client.GetTokenAsync(
            new TokenRequest {
                ClientId = "client_id",
                ClientSecret = "client_secret"
            }
        );
    }

}
