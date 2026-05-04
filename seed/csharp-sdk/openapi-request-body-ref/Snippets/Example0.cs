using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Vendor.UpdateVendorAsync(
            new UpdateVendorBody {
                VendorId = "vendor_id",
                Body = new UpdateVendorRequest {
                    Name = "name"
                }
            }
        );
    }

}
