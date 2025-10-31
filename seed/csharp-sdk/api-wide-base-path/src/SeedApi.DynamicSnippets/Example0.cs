using SeedApiWideBasePath;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedApiWideBasePathClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.PostAsync(
            "pathParam",
            "serviceParam",
            "resourceParam",
            1
        );
    }

}
