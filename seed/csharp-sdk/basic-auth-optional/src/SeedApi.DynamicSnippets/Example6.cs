using SeedBasicAuthOptional;

namespace Usage;

public class Example6
{
    public async Task Do() {
        var client = new SeedBasicAuthOptionalClient(
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
