using SeedApi;

namespace Usage;

public class Example2
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsContainer.EndpointsContainerGetAndReturnListOfObjectsAsync(
            new List<TypesObjectWithRequiredField>(){
                new TypesObjectWithRequiredField {
                    String = "string"
                },
            }
        );
    }

}
