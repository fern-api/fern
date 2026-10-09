using SeedPackageYml;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedPackageYmlClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EchoAsync(
            id: "id-ksfd9c1",
            request: new EchoRequest {
                Name = "Hello world!",
                Size = 20
            }
        );
    }

}
