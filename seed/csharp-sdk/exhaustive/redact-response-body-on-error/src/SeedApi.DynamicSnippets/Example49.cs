using SeedApi;

namespace Usage;

public class Example49
{
    public async Task Do() {
        var client = new SeedApiClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.EndpointsObject.EndpointsObjectGetAndReturnWithMixedRequiredAndOptionalFieldsAsync(
            new TypesObjectWithMixedRequiredAndOptionalFields {
                RequiredString = "requiredString",
                RequiredInteger = 1,
                OptionalString = "optionalString",
                RequiredLong = 1000000L
            }
        );
    }

}
