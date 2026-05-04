using SeedBasicAuthPwOmitted;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedBasicAuthPwOmittedClient(
            username: "<username>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.BasicAuth.GetWithBasicAuthAsync();
    }

}
