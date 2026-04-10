using SeedApi;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedApiClient(
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
