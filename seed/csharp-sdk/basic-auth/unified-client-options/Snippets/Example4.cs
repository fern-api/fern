using SeedBasicAuth;

public partial class Examples
{
    public async Task Example4() {
        var client = new SeedBasicAuthClient(
            clientOptions: new ClientOptions {
                Username = "<username>",
                Password = "<password>",
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
