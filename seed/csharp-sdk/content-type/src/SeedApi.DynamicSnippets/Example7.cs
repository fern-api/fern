using SeedApi;

namespace Usage;

public class Example7
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Service.OptionalmergepatchtestAsync(
            new ServiceOptionalMergePatchTestRequest {
                RequiredField = "requiredField",
                OptionalString = "optionalString",
                OptionalInteger = 1,
                OptionalBoolean = true,
                NullableString = "nullableString"
            }
        );
    }

}
