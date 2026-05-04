using SeedApi;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Vendor.CreateVendorAsync(
            new CreateVendorRequest {
                Name = "name"
            }
        );
    }

}
