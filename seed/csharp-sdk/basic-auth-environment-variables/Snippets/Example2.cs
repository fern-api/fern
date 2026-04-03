using SeedBasicAuthEnvironmentVariables;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedBasicAuthEnvironmentVariablesClient(
            username: "<username>",
            accessToken: "<password>",
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
