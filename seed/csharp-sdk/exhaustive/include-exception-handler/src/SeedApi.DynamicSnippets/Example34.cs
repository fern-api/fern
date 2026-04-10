using SeedApi;

namespace Usage;

public class Example34
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsObject.EndpointsObjectGetAndReturnWithRequiredFieldAsync(
            new TypesObjectWithRequiredField {
                String = "string"
            }
        );
    }

}
