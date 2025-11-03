using SeedLicense;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedLicenseClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.GetAsync();
    }

}
