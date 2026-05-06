using SeedApi;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.GetTokenAsync(
            new GetTokenRequest {
                ClientId = "client_id",
                ClientSecret = "client_secret"
            }
        );
    }

}
