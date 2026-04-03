using SeedBasicAuthPwOmitted;

namespace Usage;

public class Example5
{
    public async Task Do() {
        var client = new SeedBasicAuthPwOmittedClient(
            username: "<username>",
            password: "<password>",
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
