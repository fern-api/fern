using SeedApi;
using SeedApi.Core;

namespace Usage;

public class Example50
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsObject.EndpointsObjectGetAndReturnWithRequiredNestedObjectAsync(
            new TypesObjectWithRequiredNestedObject {
                RequiredString = "requiredString",
                RequiredObject = new TypesNestedObjectWithRequiredField {
                    String = "string",
                    NestedObject = new TypesObjectWithOptionalField()
                }
            }
        );
    }

}
