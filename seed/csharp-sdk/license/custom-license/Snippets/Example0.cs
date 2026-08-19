using SeedLicense;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedLicenseClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.GetAsync();
    }

}
