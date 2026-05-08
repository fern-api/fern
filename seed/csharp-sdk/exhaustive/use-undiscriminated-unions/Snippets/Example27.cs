using SeedApi;

public partial class Examples
{
    public async Task Example27() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.ContentType.PostJsonPatchContentTypeAsync(
            new TypesObjectWithOptionalField()
        );
    }

}
