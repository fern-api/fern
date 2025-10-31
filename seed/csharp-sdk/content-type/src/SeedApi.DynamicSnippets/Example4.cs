using SeedContentTypes;

namespace Usage;

public class Example4
{
    public async Task Do() {
        var client = new SeedContentTypesClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.RegularPatchAsync(
            "id",
            new RegularPatchRequest {
                Field1 = "field1",
                Field2 = 1
            }
        );
    }

}
