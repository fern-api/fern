using SeedBasicAuthOptional;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedBasicAuthOptionalClient(
            username: "<username>",
            password: "<password>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.BasicAuth.GetWithBasicAuthAsync();
    }

}
