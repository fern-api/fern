using SeedApi;

public partial class Examples
{
    public async Task Example95() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Primitive.GetAndReturnBase64Async(
            "string"
        );
    }

}
