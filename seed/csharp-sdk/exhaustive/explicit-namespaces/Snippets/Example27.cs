using SeedExhaustive;
using SeedExhaustive.Types.Object;

public partial class Examples
{
    public async Task Example27() {
        var client = new SeedExhaustiveClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Endpoints.Object.GetAndReturnWithMixedRequiredAndOptionalFieldsAsync(
            new ObjectWithMixedRequiredAndOptionalFields {
                RequiredString = "requiredString",
                RequiredInteger = 1,
                OptionalString = "optionalString",
                RequiredLong = 1000000L
            }
        );
    }

}
