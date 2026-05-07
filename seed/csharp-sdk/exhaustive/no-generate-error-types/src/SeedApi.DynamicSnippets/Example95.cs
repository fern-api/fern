using SeedApi;

namespace Usage;

public class Example95
{
    public async Task Do() {
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
