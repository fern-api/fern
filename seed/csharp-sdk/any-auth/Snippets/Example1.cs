using SeedAnyAuth;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedAnyAuthClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetAsync();
    }

}
