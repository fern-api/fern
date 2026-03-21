using SeedBasicAuth;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedBasicAuthClient(
            clientOptions: new ClientOptions {
                Username = "<username>",
                Password = "<password>",
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.BasicAuth.GetWithBasicAuthAsync();
    }

}
