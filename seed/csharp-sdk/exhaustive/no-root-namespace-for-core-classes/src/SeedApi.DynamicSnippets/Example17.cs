using SeedApi;
using SeedApi.Core;

namespace Usage;

public class Example17
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Container.GetAndReturnSetOfObjectsAsync(
            new List<TypesObjectWithRequiredField>(){
                new TypesObjectWithRequiredField {
                    String = "string"
                },
            }
        );
    }

}
