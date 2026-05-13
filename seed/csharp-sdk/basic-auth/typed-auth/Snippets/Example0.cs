using SeedBasicAuth;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedBasicAuthClient(
            auth: new Auth.Basic {Username = "<username>", Password = "<password>"},
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.BasicAuth.GetWithBasicAuthAsync();
    }

}
