using SeedVersion;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedVersionClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.User.GetUserAsync(
            "userId"
        );
    }

}
