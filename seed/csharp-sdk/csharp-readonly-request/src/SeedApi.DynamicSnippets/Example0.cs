using SeedCsharpReadonlyRequest;

namespace Usage;

public class Example0
{
    public async Task Do() {
        var client = new SeedCsharpReadonlyRequestClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.BatchCreateAsync(
            new CreateVendorRequest {
                Vendors = new Dictionary<string, Vendor>(){
                    ["vendor-1"] = new Vendor {
                        Id = "vendor-1",
                        Name = "Acme Corp",
                        CreatedAt = "2024-01-01T00:00:00Z",
                        UpdatedAt = "2024-01-01T00:00:00Z"
                    },
                }

            }
        );
    }

}
