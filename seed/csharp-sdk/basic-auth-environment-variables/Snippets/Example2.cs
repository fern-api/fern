using SeedBasicAuthEnvironmentVariables;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedBasicAuthEnvironmentVariablesClient(
            username: "YOUR_USERNAME",
            accessToken: "YOUR_PASSWORD",
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
