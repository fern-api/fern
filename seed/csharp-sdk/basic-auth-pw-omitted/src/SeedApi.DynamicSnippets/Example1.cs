using SeedBasicAuthPwOmitted;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedBasicAuthPwOmittedClient(
            username: "<username>",
            password: "<password>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.BasicAuth.GetWithBasicAuthAsync();
    }

}
