using SeedBasicAuthPwOmitted;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new SeedBasicAuthPwOmittedClient(
            username: "<username>",
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
