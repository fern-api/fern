using SeedApi;
using SeedApi.EndpointsObject;

namespace Usage;

public class Example40
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsObject.EndpointsObjectGetAndReturnNestedWithRequiredFieldAsync(
            new EndpointsObjectGetAndReturnNestedWithRequiredFieldRequest {
                String = "string",
                Body = new TypesNestedObjectWithRequiredField {
                    String = "string",
                    NestedObject = new TypesObjectWithOptionalField()
                }
            }
        );
    }

}
