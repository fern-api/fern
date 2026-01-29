using SeedCsharpReadonlyRequest;

namespace Usage;

public class Example1
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
                    ["vendors"] = new Vendor {
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
