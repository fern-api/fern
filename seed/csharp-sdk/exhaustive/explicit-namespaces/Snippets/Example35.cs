using SeedApi;
using SeedApi.Endpoints.HttpMethods;

public partial class Examples
{
    public async Task Example35() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.HttpMethods.TestPutAsync(
            new TestPutHttpMethodsRequest {
                Id = "id",
                Body = new TypesObjectWithRequiredField {
                    String = "string"
                }
            }
        );
    }

}
