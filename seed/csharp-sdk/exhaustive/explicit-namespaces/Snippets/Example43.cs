using SeedApi;

public partial class Examples
{
    public async Task Example43() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.GetAndReturnWithOptionalFieldAsync(
            new TypesObjectWithOptionalField()
        );
    }

}
