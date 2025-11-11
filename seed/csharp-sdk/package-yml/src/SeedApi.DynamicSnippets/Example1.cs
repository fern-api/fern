using SeedPackageYml;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedPackageYmlClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EchoAsync(
            "id",
            new EchoRequest {
                Name = "name",
                Size = 1
            }
        );
    }

}
