using SeedContentTypes;

namespace Usage;

public class Example3
{
    public async Task Do() {
        var client = new SeedContentTypesClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.OptionalMergePatchTestAsync(
            new OptionalMergePatchRequest {
                RequiredField = "requiredField",
                OptionalString = "optionalString",
                OptionalInteger = 1,
                OptionalBoolean = true,
                NullableString = "nullableString"
            }
        );
    }

}
