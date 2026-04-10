using SeedPackageYml;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new SeedPackageYmlClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.NopAsync(
            "id",
            "nestedId"
        );
    }

}
