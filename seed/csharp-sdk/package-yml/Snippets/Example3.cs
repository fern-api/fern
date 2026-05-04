using SeedPackageYml;

public partial class Examples
{
    public async Task Example3() {
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
