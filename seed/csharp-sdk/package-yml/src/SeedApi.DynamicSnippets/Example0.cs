using SeedPackageYml;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedPackageYmlClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EchoAsync(
            "id-ksfd9c1",
            new EchoRequest {
                Name = "Hello world!",
                Size = 20
            }
        );
    }

}
