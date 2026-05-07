using SeedApi;

namespace Usage;

public class Example43
{
    public async Task Do() {
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
