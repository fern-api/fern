using SeedPackageYml;

public partial class Examples
{
    public async Task Example1() {
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
