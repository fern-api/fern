using SeedApi;

namespace Usage;

public class Example10
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsContainer.EndpointsContainerGetAndReturnMapOfPrimToObjectAsync(
            new Dictionary<string, TypesObjectWithRequiredField>(){
                ["key"] = new TypesObjectWithRequiredField {
                    String = "string"
                },
            }
        );
    }

}
