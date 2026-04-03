using SeedBasicAuth;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedBasicAuthClient(
            username: "<username>",
            password: "<password>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.BasicAuth.GetWithBasicAuthAsync();
    }

}
