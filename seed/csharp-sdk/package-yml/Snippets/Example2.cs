using SeedPackageYml;

public partial class Examples
{
    public async Task Example2() {
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
