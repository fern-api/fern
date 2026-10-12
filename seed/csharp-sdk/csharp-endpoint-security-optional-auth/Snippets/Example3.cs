using SeedCsharpEndpointSecurityOptionalAuth;

public partial class Examples
{
    public async Task Example3() {
        var client = new SeedCsharpEndpointSecurityOptionalAuthClient(
            username: "<username>",
            password: "<password>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetUserAsync();
    }

}
