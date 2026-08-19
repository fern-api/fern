using SeedApiWideBasePath;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedApiWideBasePathClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.PostAsync(
            "pathParam",
            "serviceParam",
            1,
            "resourceParam"
        );
    }

}
