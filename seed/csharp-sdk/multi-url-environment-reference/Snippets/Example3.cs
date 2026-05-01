using SeedApi;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedApiClient(
            token: "<token>"
        );

        await client.Auth.GettokenAsync(
            new AuthGetTokenRequest {
                ClientId = "client_id",
                ClientSecret = "client_secret"
            }
        );
    }

}
