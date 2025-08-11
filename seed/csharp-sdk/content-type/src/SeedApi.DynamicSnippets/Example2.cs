using global::System.Threading.Tasks;
using SeedContentTypes;

namespace Usage;

public class Example2
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedContentTypesClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.RegularPatchAsync(
            "id",
            new RegularPatchRequest{
                Field1 = "field1",
                Field2 = 1
            }
        );
    }

}
