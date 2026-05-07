using SeedApi;
using SeedApi.Core;

namespace Usage;

public class Example41
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.HttpMethods.HttpMethodsTestPostAsync(
            new TypesObjectWithRequiredField {
                String = "string"
            }
        );
    }

}
