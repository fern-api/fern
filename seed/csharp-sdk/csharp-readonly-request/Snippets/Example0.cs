using SeedApi;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedCsharpReadonlyRequestClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client._.BatchCreateAsync(
            new CreateVendorRequest {
                Vendors = new Dictionary<string, Vendor>(){
                    ["key"] = new Vendor {
                        Id = "id",
                        Name = "name",
                        CreatedAt = "created_at",
                        UpdatedAt = "updated_at"
                    },
                }

            }
        );
    }

}
