using SeedApi;

namespace Usage;

public class Example24
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsHttpMethods.EndpointsHttpMethodsTestPutAsync(
            new EndpointsHttpMethodsTestPutRequest {
                Id = "id",
                Body = new TypesObjectWithRequiredField {
                    String = "string"
                }
            }
        );
    }

}
