using SeedApi;
using SeedApi.Endpoints;

namespace Usage;

public class Example35
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.HttpMethods.HttpMethodsTestPutAsync(
            new HttpMethodsTestPutHttpMethodsRequest {
                Id = "id",
                Body = new TypesObjectWithRequiredField {
                    String = "string"
                }
            }
        );
    }

}
