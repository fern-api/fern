using SeedApi;

namespace Usage;

public class Example53
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.GetAndReturnNestedWithRequiredFieldAsListAsync(
            new List<TypesNestedObjectWithRequiredField>(){
                new TypesNestedObjectWithRequiredField {
                    String = "string",
                    NestedObject = new TypesObjectWithOptionalField()
                },
            }
        );
    }

}
