using SeedApi;
using SeedApi.Core;

namespace Usage;

public class Example42
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsObject.EndpointsObjectGetAndReturnNestedWithRequiredFieldAsListAsync(
            new List<TypesNestedObjectWithRequiredField>(){
                new TypesNestedObjectWithRequiredField {
                    String = "string",
                    NestedObject = new TypesObjectWithOptionalField()
                },
            }
        );
    }

}
