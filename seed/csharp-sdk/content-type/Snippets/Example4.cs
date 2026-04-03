using SeedContentTypes;

public partial class Examples
{
    public async Task Example4() {
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
