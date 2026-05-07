using SeedApi;
using SeedApi.Endpoints.Object;

namespace Usage;

public class Example51
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.GetAndReturnNestedWithRequiredFieldAsync(
            new GetAndReturnNestedWithRequiredFieldObjectRequest {
                String = "string",
                Body = new TypesNestedObjectWithRequiredField {
                    String = "string",
                    NestedObject = new TypesObjectWithOptionalField()
                }
            }
        );
    }

}
