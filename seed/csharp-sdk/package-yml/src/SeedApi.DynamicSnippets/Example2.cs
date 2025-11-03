using SeedPackageYml;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedPackageYmlClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.NopAsync(
            "id-a2ijs82",
            "id-219xca8"
        );
    }

}
