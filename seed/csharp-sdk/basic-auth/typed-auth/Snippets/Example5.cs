using SeedBasicAuth;

public partial class Examples
{
    public async Task Example5() {
        var client = new SeedBasicAuthClient(
            auth: new Auth.Basic {Username = "<username>", Password = "<password>"},
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.BasicAuth.PostWithBasicAuthAsync(
            new Dictionary<string, object>()
            {
                ["key"] = "value",
            }
        );
    }

}
